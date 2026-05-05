import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../utils/requestUser';
import {
  deleteConversation,
  getConversation,
  listConversations,
  sendMessage,
} from '../services/chatService';

export const chatSendSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(120).nullable().optional(),
});

export type ChatSendBody = z.infer<typeof chatSendSchema>;

export const chatSendHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const body = req.body as ChatSendBody;
  const result = await sendMessage({
    userId: user.id,
    message: body.message,
    conversationId: body.conversationId ?? null,
    title: body.title ?? null,
  });
  res.status(201).json(result);
};

export const listConversationsHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const rows = await listConversations(user.id);
  res.json({
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      messageCount: r._count.messages,
    })),
  });
};

export const getConversationHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const convo = await getConversation(user.id, req.params.id);
  res.json({
    id: convo.id,
    title: convo.title,
    createdAt: convo.createdAt,
    updatedAt: convo.updatedAt,
    messages: convo.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
};

export const deleteConversationHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  await deleteConversation(user.id, req.params.id);
  res.status(204).send();
};
