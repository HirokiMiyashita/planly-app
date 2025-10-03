import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.lineUserId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: session.user.lineUserId },
      data: { isFriendAdded: true },
    });

    return NextResponse.json({
      success: true,
      message: "Friend added status updated",
    });
  } catch (error) {
    console.error("Mark friend added error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
