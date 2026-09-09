"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getEventGroup(token: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.lineUserId;
  const group = await prisma.eventGroup.findUnique({
    where: { inviteToken: token },
    select: {
      title: true,
      description: true,
      events: {
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          isConfirmed: true,
          confirmedSlotId: true,
          slots: {
            select: {
              id: true,
              day: true,
              startAt: true,
              endAt: true,
              participations: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: [{ day: "asc" }, { startAt: "asc" }],
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!group) {
    return null;
  }

  const sortedEvents = [...group.events].sort((a, b) => {
    const aSlot = a.slots[0];
    const bSlot = b.slots[0];
    if (!aSlot && !bSlot) {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    if (!aSlot) {
      return 1;
    }
    if (!bSlot) {
      return -1;
    }
    const dayDiff = aSlot.day.getTime() - bSlot.day.getTime();
    if (dayDiff !== 0) {
      return dayDiff;
    }
    const startDiff = aSlot.startAt.localeCompare(bSlot.startAt);
    if (startDiff !== 0) {
      return startDiff;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return {
    title: group.title,
    description: group.description,
    events: sortedEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      created_at: event.createdAt.toISOString(),
      isConfirmed: event.isConfirmed,
      confirmedSlotId: event.confirmedSlotId,
      slots: event.slots.map((slot) => ({
        id: slot.id,
        day: slot.day.toISOString().split("T")[0],
        start_at: slot.startAt,
        end_at: slot.endAt,
        participations: slot.participations.map((participation) => ({
          id: participation.id,
          userId: participation.userId,
          userName: participation.user.name,
          userPictureUrl: participation.user.pictureUrl,
          comment: participation.comment,
          status: participation.status,
          createdAt: participation.createdAt.toISOString(),
          updatedAt: participation.updatedAt.toISOString(),
        })),
      })),
      currentUserParticipation: userId
        ? event.slots.flatMap((slot) =>
            slot.participations
              .filter((participation) => participation.userId === userId)
              .map((participation) => ({
                id: participation.id,
                userId: participation.userId,
                userName: participation.user.name,
                userPictureUrl: participation.user.pictureUrl,
                comment: participation.comment,
                status: participation.status,
                createdAt: participation.createdAt.toISOString(),
                updatedAt: participation.updatedAt.toISOString(),
              })),
          )
        : [],
      isUserRegistered: userId
        ? event.slots.every((slot) =>
            slot.participations.some(
              (participation) => participation.userId === userId,
            ),
          )
        : false,
    })),
  };
}

export async function getOwnedEventGroup(id: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.lineUserId;

  if (!userId) {
    return null;
  }

  const group = await prisma.eventGroup.findFirst({
    where: {
      id,
      createdBy: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      inviteToken: true,
      events: {
        select: {
          id: true,
          title: true,
          description: true,
          isConfirmed: true,
          slots: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!group) {
    return null;
  }

  return {
    ...group,
    createdAt: group.createdAt.toISOString(),
  };
}
