import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExtendedNextRequest } from "./auth-controller";
import { Status } from "@prisma/client";

interface StudentAssignment {
  id: string;
  classroomId: string;
  articleId: string;
  title: string | null;
  description: string | null;
  dueDate: string;
  status: number;
  createdAt: string;
  userId: string | null;
  displayName?: string;
  teacherDisplayName?: string;
}

export async function getAssignments(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const articleId = searchParams.get("articleId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!classroomId) {
      return NextResponse.json(
        { message: "Missing classroomId in query parameters" },
        { status: 400 }
      );
    }

    if (articleId) {
      // Get assignment for specific article and classroom
      const assignment = await prisma.assignment.findFirst({
        where: {
          classroomId,
          articleId,
        },
        include: {
          article: {
            select: {
              title: true,
              summary: true,
            },
          },
          classroom: {
            select: {
              classroomName: true,
            },
          },
          studentAssignments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!assignment) {
        return NextResponse.json({ meta: {}, students: [] }, { status: 200 });
      }

      // Get metadata from assignment
      const meta = {
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        classroomId: assignment.classroomId,
        articleId: assignment.articleId,
        createdAt: assignment.createdAt,
      };

      const students = assignment.studentAssignments.map((sa) => ({
        id: sa.id,
        studentId: sa.studentId,
        status: sa.status === Status.NOT_STARTED ? 0 : 
                sa.status === Status.IN_PROGRESS ? 1 : 
                sa.status === Status.COMPLETED ? 2 : 0,
        displayName: sa.student?.name,
      }));

      return NextResponse.json({ meta, students }, { status: 200 });
    } else {
      // Get all assignments for classroom
      let whereClause: any = {
        classroomId,
      };

      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase().trim();
        whereClause.OR = [
          { title: { contains: searchLower, mode: 'insensitive' } },
          { description: { contains: searchLower, mode: 'insensitive' } },
        ];
      }

      const totalCount = await prisma.assignment.count({
        where: whereClause,
      });

      const assignments = await prisma.assignment.findMany({
        where: whereClause,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              summary: true,
            },
          },
          studentAssignments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Transform assignments to include student data
      const result = assignments.map((assignment) => ({
        articleId: assignment.articleId,
        meta: {
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          classroomId: assignment.classroomId,
          articleId: assignment.articleId,
          createdAt: assignment.createdAt,
        },
        students: assignment.studentAssignments.map((sa) => ({
          id: sa.id,
          studentId: sa.studentId,
          status: sa.status === Status.NOT_STARTED ? 0 : 
                  sa.status === Status.IN_PROGRESS ? 1 : 
                  sa.status === Status.COMPLETED ? 2 : 0,
          displayName: sa.student?.name,
        })),
        article: assignment.article,
      }));

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json(
        {
          assignments: result,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function postAssignment(req: ExtendedNextRequest) {
  try {
    const data = await req.json();

    const {
      classroomId,
      articleId,
      title,
      description,
      dueDate,
      selectedStudents,
      userId,
    } = data;

    if (!classroomId || !articleId || !selectedStudents || !Array.isArray(selectedStudents)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 }
      );
    }

    // Check if assignment already exists for this classroom and article
    let assignment = await prisma.assignment.findFirst({
      where: {
        classroomId,
        articleId,
      },
      include: {
        studentAssignments: true,
      },
    });

    // Create assignment if it doesn't exist
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          classroomId,
          articleId,
          title: title || null,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: {
          studentAssignments: true,
        },
      });
    }

    // Get existing student assignments
    const existingStudentIds = new Set(
      assignment.studentAssignments.map(sa => sa.studentId)
    );

    // Filter out students who already have assignments
    const newStudentIds = selectedStudents.filter(
      (studentId: string) => !existingStudentIds.has(studentId)
    );

    if (newStudentIds.length === 0) {
      return NextResponse.json(
        { message: "All students already have this assignment" },
        { status: 200 }
      );
    }

    // Create student assignments
    const studentAssignmentsData = newStudentIds.map((studentId: string) => ({
      assignmentId: assignment.id,
      studentId,
      status: Status.NOT_STARTED,
    }));

    const createdStudentAssignments = await prisma.studentAssignment.createMany({
      data: studentAssignmentsData,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: `${createdStudentAssignments.count} student assignments created successfully`,
        assignmentId: assignment.id,
        created: createdStudentAssignments.count,
        skipped: selectedStudents.length - createdStudentAssignments.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function updateAssignment(req: ExtendedNextRequest) {
  try {
    const data = await req.json();
    const { classroomId, articleId, studentId, updates } = data;

    if (!classroomId || !articleId || !updates) {
      return NextResponse.json(
        {
          message: "Missing required fields: classroomId, articleId, or updates",
        },
        { status: 400 }
      );
    }

    if (studentId === "meta") {
      // Update metadata for the assignment (not student-specific)
      const allowedMetaFields = ["title", "description", "dueDate"];
      const filteredUpdates: any = {};
      
      for (const key of allowedMetaFields) {
        if (updates.hasOwnProperty(key)) {
          if (key === "dueDate" && updates[key]) {
            filteredUpdates[key] = new Date(updates[key]);
          } else {
            filteredUpdates[key] = updates[key];
          }
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return NextResponse.json(
          { message: "No valid metadata fields to update" },
          { status: 400 }
        );
      }

      const updatedAssignment = await prisma.assignment.updateMany({
        where: {
          classroomId,
          articleId,
        },
        data: filteredUpdates,
      });

      return NextResponse.json(
        { 
          message: "Assignment metadata updated successfully",
          updatedCount: updatedAssignment.count 
        },
        { status: 200 }
      );
    } else {
      // Update specific student assignment status
      if (!studentId) {
        return NextResponse.json(
          { message: "Missing studentId for individual assignment update" },
          { status: 400 }
        );
      }

      // Find the assignment first
      const assignment = await prisma.assignment.findFirst({
        where: {
          classroomId,
          articleId,
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { message: "Assignment not found" },
          { status: 404 }
        );
      }

      // Prepare updates for StudentAssignment
      const studentAssignmentUpdates: any = {};
      
      if (updates.hasOwnProperty("status")) {
        studentAssignmentUpdates.status = updates.status as Status;
        
        // Update timestamps based on status
        if (updates.status === Status.IN_PROGRESS && !updates.startedAt) {
          studentAssignmentUpdates.startedAt = new Date();
        } else if (updates.status === Status.COMPLETED && !updates.completedAt) {
          studentAssignmentUpdates.completedAt = new Date();
        }
      }

      if (updates.hasOwnProperty("startedAt")) {
        studentAssignmentUpdates.startedAt = updates.startedAt ? new Date(updates.startedAt) : null;
      }

      if (updates.hasOwnProperty("completedAt")) {
        studentAssignmentUpdates.completedAt = updates.completedAt ? new Date(updates.completedAt) : null;
      }

      if (updates.hasOwnProperty("score")) {
        studentAssignmentUpdates.score = updates.score;
      }

      if (Object.keys(studentAssignmentUpdates).length === 0) {
        return NextResponse.json(
          { message: "No valid fields to update" },
          { status: 400 }
        );
      }

      // Update or create student assignment
      const updatedStudentAssignment = await prisma.studentAssignment.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: studentId,
          },
        },
        update: studentAssignmentUpdates,
        create: {
          assignmentId: assignment.id,
          studentId: studentId,
          ...studentAssignmentUpdates,
          status: studentAssignmentUpdates.status || Status.NOT_STARTED,
        },
      });

      return NextResponse.json(
        { 
          message: "Student assignment updated successfully",
          studentAssignment: updatedStudentAssignment,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getStudentAssignments(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const dueDateFilter = searchParams.get("dueDateFilter");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (studentId) {
      const userExists = await prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, email: true }
      });
    }

    if (!studentId) {
      return NextResponse.json(
        { message: "Missing studentId in query parameters" },
        { status: 400 }
      );
    }

    // Build where clause for StudentAssignment
    let studentAssignmentWhere: any = {
      studentId: studentId,
    };

    // Apply status filter
    if (status && status !== "all") {
      // Convert numeric string to Status enum
      let statusEnum: Status;
      switch (status) {
        case "0":
          statusEnum = Status.NOT_STARTED;
          break;
        case "1":
          statusEnum = Status.IN_PROGRESS;
          break;
        case "2":
          statusEnum = Status.COMPLETED;
          break;
        default:
          statusEnum = status as Status; // fallback for enum values
      }
      studentAssignmentWhere.status = statusEnum;
    }

    // Build where clause for Assignment (for search and dueDate filters)
    let assignmentWhere: any = {};

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      assignmentWhere.OR = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    // Apply due date filter
    if (dueDateFilter && dueDateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      switch (dueDateFilter) {
        case "overdue":
          assignmentWhere.dueDate = { lt: today };
          break;
        case "today":
          assignmentWhere.dueDate = { gte: today, lt: tomorrow };
          break;
        case "upcoming":
          assignmentWhere.dueDate = { gte: tomorrow };
          break;
      }
    }

    // Combine where clauses
    if (Object.keys(assignmentWhere).length > 0) {
      studentAssignmentWhere.assignment = assignmentWhere;
    }

    const totalCount = await prisma.studentAssignment.count({
      where: studentAssignmentWhere,
    });

    const studentAssignments = await prisma.studentAssignment.findMany({
      where: studentAssignmentWhere,
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        assignment: {
          include: {
            article: {
              select: {
                title: true,
                summary: true,
              },
            },
            classroom: {
              select: {
                classroomName: true,
                teachers: {
                  include: {
                    teacher: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        assignment: {
          dueDate: "asc",
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedAssignments: StudentAssignment[] = studentAssignments.map((sa) => ({
      id: sa.id,
      classroomId: sa.assignment.classroomId,
      articleId: sa.assignment.articleId,
      title: sa.assignment.title,
      description: sa.assignment.description,
      dueDate: sa.assignment.dueDate ? sa.assignment.dueDate.toISOString() : "",
      status: sa.status === Status.NOT_STARTED ? 0 : 
              sa.status === Status.IN_PROGRESS ? 1 : 
              sa.status === Status.COMPLETED ? 2 : 0,
      createdAt: sa.createdAt.toISOString(),
      userId: sa.studentId,
      displayName: sa.student?.name || "Unknown User",
      teacherDisplayName: sa.assignment.classroom?.teachers?.[0]?.teacher?.name || "Unknown Teacher",
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        assignments: formattedAssignments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching student assignments:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function deleteAssignment(req: ExtendedNextRequest) {
  try {
    const data = await req.json();
    const { classroomId, articleId, studentIds } = data;

    if (
      !classroomId ||
      !articleId ||
      !studentIds ||
      !Array.isArray(studentIds) ||
      studentIds.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: classroomId, articleId, or studentIds array",
        },
        { status: 400 }
      );
    }

    // Find the assignment
    const assignment = await prisma.assignment.findFirst({
      where: {
        classroomId,
        articleId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete student assignments
    const deletedStudentAssignments = await prisma.studentAssignment.deleteMany({
      where: {
        assignmentId: assignment.id,
        studentId: { in: studentIds },
      },
    });

    if (deletedStudentAssignments.count === 0) {
      return NextResponse.json(
        { message: "No student assignments found to delete" },
        { status: 404 }
      );
    }

    // Check if there are any remaining student assignments
    const remainingCount = await prisma.studentAssignment.count({
      where: {
        assignmentId: assignment.id,
      },
    });

    // If no students left, delete the assignment itself
    if (remainingCount === 0) {
      await prisma.assignment.delete({
        where: {
          id: assignment.id,
        },
      });
    }

    return NextResponse.json(
      {
        message: `${deletedStudentAssignments.count} student assignment(s) deleted successfully`,
        deletedCount: deletedStudentAssignments.count,
        assignmentDeleted: remainingCount === 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting assignments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
