"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function markFriendAdded() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.lineUserId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    await prisma.user.update({
      where: { id: session.user.lineUserId },
      data: { isFriendAdded: true },
    });

    return {
      success: true,
      message: "Friend added status updated",
    };
  } catch (error) {
    console.error("Mark friend added error:", error);
    return {
      success: false,
      error: "Server error",
    };
  }
}
