import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import {
  chatSendHandler,
  chatSendSchema,
  deleteConversationHandler,
  getConversationHandler,
  listConversationsHandler,
} from '../controllers/chatController';

export const chatRouter = Router();

// Chat is another AI endpoint; tighter per-user limit sits on top of the global one.
const aiLimit = rateLimit({
  keyPrefix: 'rl:ai:chat',
  windowMs: 60_000,
  max: 30,
  keyFn: (req) => req.user?.id ?? req.ip ?? 'unknown',
});

chatRouter.post('/chat', requireAuth, aiLimit, validate(chatSendSchema), chatSendHandler);
chatRouter.get('/chat/conversations', requireAuth, listConversationsHandler);
chatRouter.get('/chat/conversations/:id', requireAuth, getConversationHandler);
chatRouter.delete('/chat/conversations/:id', requireAuth, deleteConversationHandler);
