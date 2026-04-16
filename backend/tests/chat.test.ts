import { describe, expect, it } from 'vitest';
import { stubProvider } from '../src/ai/stubProvider';
import { chatSendSchema } from '../src/controllers/chatController';

describe('stubProvider.chat', () => {
  it('echoes the last user message and reports zero usage', async () => {
    const res = await stubProvider.chat({
      messages: [
        { role: 'system', content: 'ignored by stub' },
        { role: 'user', content: 'How many calories in a banana?' },
      ],
    });
    expect(res.data.reply).toContain('banana');
    expect(res.usage.totalTokens).toBe(0);
    expect(res.usage.costUsd).toBe(0);
    expect(res.model).toBe('stub-chat-v1');
  });

  it('handles conversations with no user turn gracefully', async () => {
    const res = await stubProvider.chat({
      messages: [{ role: 'assistant', content: 'hi there' }],
    });
    expect(res.data.reply.length).toBeGreaterThan(0);
  });
});

describe('chatSendSchema', () => {
  it('accepts a message with no conversationId', () => {
    const parsed = chatSendSchema.parse({ message: 'Hello' });
    expect(parsed.message).toBe('Hello');
    expect(parsed.conversationId).toBeUndefined();
  });

  it('accepts a message with a valid conversationId', () => {
    const parsed = chatSendSchema.parse({
      message: 'follow up',
      conversationId: '00000000-0000-0000-0000-000000000001',
    });
    expect(parsed.conversationId).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('trims and enforces min length', () => {
    expect(() => chatSendSchema.parse({ message: '   ' })).toThrow();
  });

  it('rejects empty messages', () => {
    expect(() => chatSendSchema.parse({ message: '' })).toThrow();
  });

  it('rejects messages longer than 4000 characters', () => {
    expect(() => chatSendSchema.parse({ message: 'x'.repeat(4001) })).toThrow();
  });

  it('rejects invalid conversationId', () => {
    expect(() =>
      chatSendSchema.parse({ message: 'hi', conversationId: 'not-a-uuid' }),
    ).toThrow();
  });
});
