import { createHash, randomBytes } from 'node:crypto';
import type { FamilyInvite, FamilyMember, User } from '@prisma/client';
import { FamilyInviteStatus, FamilyRole } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { addUtcDays } from '../utils/date';
import { dailyAnalytics, macroAnalytics, streakAnalytics } from './analyticsService';

const INVITE_TTL_DAYS = 14;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const publicUser = (user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatarUrl: user.avatarUrl,
});

export const getOrCreateOwnedFamily = async (userId: string, ownerName?: string | null) => {
  const existing = await prisma.family.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) {
    await prisma.familyMember.upsert({
      where: { familyId_userId: { familyId: existing.id, userId } },
      update: { role: FamilyRole.OWNER, analyticsAccess: true },
      create: {
        familyId: existing.id,
        userId,
        role: FamilyRole.OWNER,
        analyticsAccess: true,
      },
    });
    return existing;
  }

  return prisma.family.create({
    data: {
      name: ownerName ? `${ownerName}'s family` : 'My family',
      ownerId: userId,
      members: {
        create: {
          userId,
          role: FamilyRole.OWNER,
          analyticsAccess: true,
        },
      },
    },
  });
};

export const getFamilyOverview = async (userId: string) => {
  const memberships = await prisma.familyMember.findMany({
    where: { userId },
    include: {
      family: {
        include: {
          owner: { select: { id: true, email: true, name: true, avatarUrl: true } },
          members: {
            include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
            orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
          },
          invites: {
            where: { status: FamilyInviteStatus.PENDING },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const owned = memberships.find((m) => m.role === FamilyRole.OWNER)?.family ?? null;
  const visibleFamilies = memberships.map((m) => ({
    id: m.family.id,
    name: m.family.name,
    owner: publicUser(m.family.owner),
    myRole: m.role,
    members: m.family.members.map(toMemberDTO),
    invites: m.family.ownerId === userId ? m.family.invites.map(toInviteDTO) : [],
  }));

  return {
    ownedFamily: owned
      ? {
          id: owned.id,
          name: owned.name,
          owner: publicUser(owned.owner),
          myRole: FamilyRole.OWNER,
          members: owned.members.map(toMemberDTO),
          invites: owned.invites.map(toInviteDTO),
        }
      : null,
    families: visibleFamilies,
  };
};

export const createFamilyInvite = async (
  inviterId: string,
  inviterName: string | null | undefined,
  email: string,
) => {
  const normalizedEmail = normalizeEmail(email);
  const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
  if (!inviter) throw new NotFoundError('User not found');
  if (normalizeEmail(inviter.email) === normalizedEmail) {
    throw new BadRequestError('Invite another account, not your own email');
  }

  const family = await getOrCreateOwnedFamily(inviterId, inviterName ?? inviter.name);

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const existingMember = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId: family.id, userId: existingUser.id } },
    });
    if (existingMember) throw new ConflictError('This user is already in your family');
  }

  const token = randomBytes(32).toString('base64url');
  const invite = await prisma.familyInvite.create({
    data: {
      familyId: family.id,
      inviterId,
      email: normalizedEmail,
      tokenHash: hashToken(token),
      expiresAt: addUtcDays(new Date(), INVITE_TTL_DAYS),
    },
  });

  return { invite: toInviteDTO(invite), token };
};

export const acceptFamilyInvite = async (userId: string, userEmail: string, token: string) => {
  const invite = await prisma.familyInvite.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!invite) throw new NotFoundError('Invite not found');
  if (invite.status !== FamilyInviteStatus.PENDING) throw new BadRequestError('Invite is no longer active');
  if (invite.expiresAt <= new Date()) {
    await prisma.familyInvite.update({
      where: { id: invite.id },
      data: { status: FamilyInviteStatus.EXPIRED },
    });
    throw new BadRequestError('Invite has expired');
  }
  if (normalizeEmail(userEmail) !== normalizeEmail(invite.email)) {
    throw new ForbiddenError('This invite was sent to a different email');
  }

  const member = await prisma.familyMember.upsert({
    where: { familyId_userId: { familyId: invite.familyId, userId } },
    update: { analyticsAccess: invite.analyticsAccess },
    create: {
      familyId: invite.familyId,
      userId,
      role: invite.role,
      analyticsAccess: invite.analyticsAccess,
    },
    include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
  });

  await prisma.familyInvite.update({
    where: { id: invite.id },
    data: { status: FamilyInviteStatus.ACCEPTED, acceptedAt: new Date() },
  });

  return toMemberDTO(member);
};

export const revokeFamilyInvite = async (requesterId: string, inviteId: string) => {
  const invite = await prisma.familyInvite.findUnique({
    where: { id: inviteId },
    include: { family: true },
  });
  if (!invite) throw new NotFoundError('Invite not found');
  if (invite.family.ownerId !== requesterId) throw new ForbiddenError('Only the family owner can revoke invites');
  await prisma.familyInvite.update({
    where: { id: inviteId },
    data: { status: FamilyInviteStatus.REVOKED, revokedAt: new Date() },
  });
};

export const removeFamilyMember = async (requesterId: string, memberId: string) => {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: { family: true },
  });
  if (!member) throw new NotFoundError('Family member not found');

  const isOwner = member.family.ownerId === requesterId;
  const isSelf = member.userId === requesterId;
  if (!isOwner && !isSelf) throw new ForbiddenError('You cannot remove this family member');
  if (member.role === FamilyRole.OWNER && isSelf) {
    throw new BadRequestError('Family owners cannot remove themselves');
  }

  await prisma.familyMember.delete({ where: { id: memberId } });
};

const getViewableMember = async (requesterId: string, memberId: string) => {
  const target = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
  });
  if (!target) throw new NotFoundError('Family member not found');
  if (!target.analyticsAccess) throw new ForbiddenError('Analytics sharing is disabled for this member');

  const requesterMember = await prisma.familyMember.findUnique({
    where: { familyId_userId: { familyId: target.familyId, userId: requesterId } },
  });
  if (!requesterMember) throw new ForbiddenError('You do not have access to this family');
  return target;
};

export const getFamilyDailyAnalytics = async (
  requesterId: string,
  memberId: string,
  opts: { from?: Date; to?: Date } = {},
) => {
  const member = await getViewableMember(requesterId, memberId);
  return dailyAnalytics(member.userId, opts);
};

export const getFamilyMacroAnalytics = async (
  requesterId: string,
  memberId: string,
  opts: { from?: Date; to?: Date } = {},
) => {
  const member = await getViewableMember(requesterId, memberId);
  return macroAnalytics(member.userId, opts);
};

export const getFamilyStreakAnalytics = async (requesterId: string, memberId: string) => {
  const member = await getViewableMember(requesterId, memberId);
  return streakAnalytics(member.userId);
};

const toMemberDTO = (
  member: FamilyMember & { user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'> },
) => ({
  id: member.id,
  familyId: member.familyId,
  role: member.role,
  analyticsAccess: member.analyticsAccess,
  joinedAt: member.joinedAt,
  user: publicUser(member.user),
});

const toInviteDTO = (invite: FamilyInvite) => ({
  id: invite.id,
  familyId: invite.familyId,
  email: invite.email,
  role: invite.role,
  analyticsAccess: invite.analyticsAccess,
  status: invite.status,
  expiresAt: invite.expiresAt,
  createdAt: invite.createdAt,
});
