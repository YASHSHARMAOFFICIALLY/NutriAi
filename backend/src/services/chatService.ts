import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { sha256Hex } from '../utils/hash';
import { NotFoundError } from '../utils/errors';
import { getAIProvider } from '../ai';
import { canonicalize, canonicalizeText } from '../ai/canonicalize';
import { aiCacheKey, getCached, setCached } from '../ai/cache';
import { recordTokenUsage } from '../ai/usage';
import type { ChatMessage, ChatResult } from '../ai/provider';
import type { Prisma } from '@prisma/client';

interface SendMessageArgs {
  userId: string;
  conversationId?: string | null;
  message: string;
  title?: string | null;
}

interface CachedChatEnvelope {
  data: ChatResult;
  model: string;
}

const ENDPOINT = 'chat.send';

const deriveTitle = (message: string): string => {
  const trimmed = message.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 60) return trimmed;
  return trimmed.slice(0, 57) + '...';
};

const loadHistory = async (conversationId: string, limit: number): Promise<ChatMessage[]> => {
  // Fetch the most recent N messages in chronological order.
  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { role: true, content: true },
  });
  return rows.reverse().map((r) => ({
    role: r.role.toLowerCase() as ChatMessage['role'],
    content: r.content,
  }));
};

export const sendMessage = async ({ userId, conversationId, message, title }: SendMessageArgs) => {
  // Resolve or create the conversation, enforcing ownership.
  let convo: { id: string; title: string | null } | null = null;
  if (conversationId) {
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, userId: true, title: true },
    });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError('Conversation not found');
    }
    convo = { id: existing.id, title: existing.title };
  } else {
    const created = await prisma.conversation.create({
      data: {
        userId,
        title: (title ?? deriveTitle(message)) || null,
      },
      select: { id: true, title: true },
    });
    convo = created;
  }

  const history = await loadHistory(convo.id, env.AI_CHAT_HISTORY_WINDOW);
  const outgoing: ChatMessage[] = [...history, { role: 'user', content: message }];

  const provider = getAIProvider();
  const canonicalInput = canonicalize(
    outgoing.map((m) => ({ role: m.role, content: canonicalizeText(m.content) })),
  );
  const hash = sha256Hex(canonicalInput);
  const cacheKey = aiCacheKey(provider.name, 'chat', hash);

  const started = Date.now();
  const cached = await getCached<CachedChatEnvelope>(cacheKey);

  let data: ChatResult;
  let model: string;
  let cachedFlag = false;
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

  if (cached) {
    data = cached.data;
    model = cached.model;
    cachedFlag = true;
  } else {
    const call = await provider.chat({ messages: outgoing });
    data = call.data;
    model = call.model;
    usage = call.usage;
    await setCached(cacheKey, { data, model }, env.AI_CHAT_CACHE_TTL_SECONDS);
  }

  const latencyMs = Date.now() - started;

  await recordTokenUsage({
    userId,
    endpoint: ENDPOINT,
    provider: provider.name,
    model,
    usage,
    cached: cachedFlag,
    latencyMs,
  });

  // Persist both turns atomically and bump conversation updatedAt.
  const [, assistant] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: convo.id, role: 'USER', content: message },
    }),
    prisma.message.create({
      data: { conversationId: convo.id, role: 'ASSISTANT', content: data.reply },
    }),
    prisma.conversation.update({
      where: { id: convo.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  return {
    conversationId: convo.id,
    messageId: assistant.id,
    reply: data.reply,
    meta: {
      provider: provider.name,
      model,
      cached: cachedFlag,
      latencyMs,
    },
  };
};

export const listConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
};

export const getConversation = async (userId: string, id: string) => {
  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!convo || convo.userId !== userId) {
    throw new NotFoundError('Conversation not found');
  }
  return convo;
};

export const deleteConversation = async (userId: string, id: string) => {
  const convo = await prisma.conversation.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!convo || convo.userId !== userId) {
    throw new NotFoundError('Conversation not found');
  }
  await prisma.conversation.delete({ where: { id } });
};

// Exposed for typing reuse.
export type ConversationRow = Prisma.ConversationGetPayload<{
  include: { messages: true };
}>;
