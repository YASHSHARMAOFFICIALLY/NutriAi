import { prisma } from '../config/prisma';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';

const MAX_PENDING_OUTGOING = 10;

export const createInvite = async (ownerId: string, inviteEmail: string) => {
  const email = inviteEmail.trim().toLowerCase();
  if (!email) throw new BadRequestError('Email is required');

  const viewer = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });
  if (!viewer) {
    throw new NotFoundError('No NutriAI account for this email — ask them to sign up first');
  }
  if (viewer.id === ownerId) {
    throw new BadRequestError("You can't invite yourself");
  }

  const existing = await prisma.partnerShare.findUnique({
    where: { ownerId_viewerId: { ownerId, viewerId: viewer.id } },
  });
  if (existing && existing.status !== 'REVOKED') {
    throw new BadRequestError(
      existing.status === 'ACCEPTED'
        ? 'You already share your data with this person'
        : 'Invite already sent — waiting for them to accept',
    );
  }

  const pendingOutgoing = await prisma.partnerShare.count({
    where: { ownerId, status: 'PENDING' },
  });
  if (pendingOutgoing >= MAX_PENDING_OUTGOING) {
    throw new BadRequestError('Too many pending invites — revoke some first');
  }

  // Reuse the row if it was previously revoked so we don't violate the unique index.
  const share = existing
    ? await prisma.partnerShare.update({
        where: { id: existing.id },
        data: {
          status: 'PENDING',
          invitedEmail: email,
          createdAt: new Date(),
          acceptedAt: null,
          revokedAt: null,
        },
      })
    : await prisma.partnerShare.create({
        data: { ownerId, viewerId: viewer.id, invitedEmail: email },
      });

  return { share, viewer };
};

export const acceptInvite = async (viewerId: string, shareId: string) => {
  const share = await prisma.partnerShare.findUnique({ where: { id: shareId } });
  if (!share || share.viewerId !== viewerId) throw new NotFoundError('Invite not found');
  if (share.status === 'ACCEPTED') return share;
  if (share.status === 'REVOKED') throw new BadRequestError('Invite no longer valid');

  return prisma.partnerShare.update({
    where: { id: shareId },
    data: { status: 'ACCEPTED', acceptedAt: new Date() },
  });
};

// Either side can revoke. Owner revokes viewer's access; viewer opts out.
export const revokeShare = async (userId: string, shareId: string) => {
  const share = await prisma.partnerShare.findUnique({ where: { id: shareId } });
  if (!share) throw new NotFoundError('Share not found');
  if (share.ownerId !== userId && share.viewerId !== userId) {
    throw new ForbiddenError('Not allowed');
  }
  return prisma.partnerShare.update({
    where: { id: shareId },
    data: { status: 'REVOKED', revokedAt: new Date() },
  });
};

// People whose data the given viewer can see.
export const listViewable = async (viewerId: string) => {
  const rows = await prisma.partnerShare.findMany({
    where: { viewerId, status: 'ACCEPTED' },
    include: { owner: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    orderBy: { acceptedAt: 'desc' },
  });
  return rows.map((r) => ({
    shareId: r.id,
    owner: r.owner,
    acceptedAt: r.acceptedAt,
  }));
};

// Incoming pending invites addressed to the viewer.
export const listPendingForViewer = async (viewerId: string) => {
  const rows = await prisma.partnerShare.findMany({
    where: { viewerId, status: 'PENDING' },
    include: { owner: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    shareId: r.id,
    owner: r.owner,
    createdAt: r.createdAt,
  }));
};

// Outgoing — people the owner has shared with, active or pending.
export const listOutgoing = async (ownerId: string) => {
  const rows = await prisma.partnerShare.findMany({
    where: { ownerId, status: { in: ['PENDING', 'ACCEPTED'] } },
    include: { viewer: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    shareId: r.id,
    viewer: r.viewer,
    status: r.status,
    invitedEmail: r.invitedEmail,
    createdAt: r.createdAt,
    acceptedAt: r.acceptedAt,
  }));
};

// Gate for every read-through endpoint: throws unless viewer has an ACCEPTED
// share for this owner. Returns the share row for the caller to use if needed.
export const assertCanView = async (viewerId: string, ownerId: string) => {
  if (viewerId === ownerId) return null;
  const share = await prisma.partnerShare.findUnique({
    where: { ownerId_viewerId: { ownerId, viewerId } },
  });
  if (!share || share.status !== 'ACCEPTED') {
    throw new ForbiddenError("You don't have access to this person's data");
  }
  return share;
};
