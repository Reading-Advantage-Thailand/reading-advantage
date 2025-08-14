import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== Role.SYSTEM) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get("licenseId");

    if (!licenseId) {
      return NextResponse.json(
        { error: "License ID is required" },
        { status: 400 }
      );
    }

    // Find license by ID
    const license = await prisma.license.findUnique({
      where: {
        id: licenseId,
      },
    });

    if (!license) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    // Find all users with this license
    const usersWithLicense = await prisma.licenseOnUser.findMany({
      where: {
        licenseId: license.id,
      },
      select: {
        userId: true,
      },
    });

    const userIds = usersWithLicense.map(licenseUser => licenseUser.userId);

    // Find all classrooms where any of these users are teachers
    const classrooms = await prisma.classroom.findMany({
      where: {
        teachers: {
          some: {
            teacherId: {
              in: userIds,
            },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Transform data to match the expected format
    const transformedClassrooms = classrooms.map((classroom) => ({
      id: classroom.id,
      classroomName: classroom.classroomName,
      classCode: classroom.classCode,
      grade: classroom.grade?.toString() || "",
      archived: classroom.archived || false,
      title: classroom.classroomName || "",
      importedFromGoogle: false,
      alternateLink: "",
      createdAt: classroom.createdAt.toISOString(),
      createdBy: classroom.creator || { id: "", name: "" },
      isOwner: true, // For system view, we can assume ownership
      teachers: classroom.teachers.map((tc) => ({
        teacherId: tc.teacher.id,
        name: tc.teacher.name || "",
        role: tc.role,
        joinedAt: tc.createdAt.toISOString(),
      })),
      student: classroom.students.map((sc) => ({
        studentId: sc.student.id,
        email: sc.student.email || "",
        lastActivity: "",
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedClassrooms,
      schoolName: license.schoolName || "Unknown School",
    });
  } catch (error) {
    console.error("Error fetching school classrooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
