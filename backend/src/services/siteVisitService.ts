import type { Request } from 'express';
import { prisma } from '../config/prisma';
import { getSessionMetadata } from '../utils/sessionMetadata';

export interface TrackPageVisitInput {
  visitorId?: string;
  path: string;
  referrer?: string | null;
}

const botUserAgentPattern =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|bingpreview|discordbot|telegrambot|whatsapp|headlesschrome|lighthouse|pagespeed|uptime|monitor/i;

const ignoredPathPattern = /^\/(?:admin|_next|favicon\.ico|robots\.txt|sitemap\.xml)(?:\/|$)/;
const dedupeWindowMs = 5 * 60 * 1000;

export async function trackPageVisit(req: Request, input: TrackPageVisitInput) {
  const metadata = getSessionMetadata(req);
  const userAgent = metadata.userAgent ?? '';
  const path = input.path.trim();

  if (botUserAgentPattern.test(userAgent) || ignoredPathPattern.test(path)) {
    return { recorded: false };
  }

  const dedupeSince = new Date(Date.now() - dedupeWindowMs);
  const identityFilters = [
    ...(input.visitorId ? [{ visitorId: input.visitorId }] : []),
    ...(metadata.ipAddress || metadata.userAgent
      ? [{ ipAddress: metadata.ipAddress, userAgent: metadata.userAgent }]
      : []),
  ];

  if (identityFilters.length) {
    const recent = await prisma.pageVisit.findFirst({
      where: {
        path,
        createdAt: { gte: dedupeSince },
        OR: identityFilters,
      },
      select: { id: true },
    });

    if (recent) return { recorded: false };
  }

  await prisma.pageVisit.create({
    data: {
      visitorId: input.visitorId,
      path,
      referrer: input.referrer ?? null,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    },
  });

  return { recorded: true };
}
