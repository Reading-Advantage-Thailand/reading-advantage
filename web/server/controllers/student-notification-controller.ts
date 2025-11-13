import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExtendedNextRequest } from "./auth-controller";

/**
 * Get unread assignment notifications for a student
 */
export async function getStudentUnreadNotifications(
  req: ExtendedNextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    const notifications = await prisma.assignmentNotification.findMany({
      where: {
        studentId: studentId,
        isNoticed: false,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            articleId: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check if there's an unread notification for a specific assignment
 */
export async function checkStudentAssignmentNotification(
  req: ExtendedNextRequest,
  { params }: { params: { studentId: string; assignmentId: string } }
) {
  try {
    const { studentId, assignmentId } = params;

    if (!studentId || !assignmentId) {
      return NextResponse.json(
        { error: "Missing studentId or assignmentId" },
        { status: 400 }
      );
    }

    const notification = await prisma.assignmentNotification.findFirst({
      where: {
        studentId: studentId,
        assignmentId: assignmentId,
        isNoticed: false,
      },
    });

    return NextResponse.json({
      hasNotification: !!notification,
    });
  } catch (error) {
    console.error("Error checking assignment notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Mark a notification as acknowledged (noticed)
 */
export async function acknowledgeNotification(
  req: ExtendedNextRequest,
  { params }: { params: { studentId: string; notificationId: string } }
) {
  try {
    const { studentId, notificationId } = params;

    if (!studentId || !notificationId) {
      return NextResponse.json(
        { error: "Missing studentId or notificationId" },
        { status: 400 }
      );
    }

    const notification = await prisma.assignmentNotification.update({
      where: {
        id: notificationId,
        studentId: studentId,
      },
      data: {
        isNoticed: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error acknowledging notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
