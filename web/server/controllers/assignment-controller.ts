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
      // Get assignments for specific article and classroom
      const assignments = await prisma.assignment.findMany({
        where: {
          classroomId,
          articleId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get metadata from first assignment (they should all have same meta info)
      const meta = assignments.length > 0 ? {
        title: assignments[0].title,
        description: assignments[0].description,
        dueDate: assignments[0].dueDate,
        classroomId: assignments[0].classroomId,
        articleId: assignments[0].articleId,
        userId: assignments[0].userId, // Add missing userId field
        createdAt: assignments[0].createdAt,
      } : {};

      const students = assignments.map((assignment) => ({
        id: assignment.id,
        studentId: assignment.userId,
        status: assignment.status === Status.NOT_STARTED ? 0 : 
                assignment.status === Status.IN_PROGRESS ? 1 : 
                assignment.status === Status.COMPLETED ? 2 : 0,
        displayName: assignment.user?.name,
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
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Group assignments by articleId
      const groupedAssignments = assignments.reduce((acc: any, assignment) => {
        const articleId = assignment.articleId;
        
        if (!acc[articleId]) {
          acc[articleId] = {
            articleId,
            meta: {
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.dueDate,
              classroomId: assignment.classroomId,
              articleId: assignment.articleId,
              userId: assignment.userId, // Add missing userId field
              createdAt: assignment.createdAt,
            },
            students: [],
            article: assignment.article,
          };
        }

        acc[articleId].students.push({
          id: assignment.id,
          studentId: assignment.userId,
          status: assignment.status === Status.NOT_STARTED ? 0 : 
                  assignment.status === Status.IN_PROGRESS ? 1 : 
                  assignment.status === Status.COMPLETED ? 2 : 0,
          displayName: assignment.user?.name,
        });

        return acc;
      }, {});

      const result = Object.values(groupedAssignments);

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

    // Get student information
    const students = await prisma.user.findMany({
      where: {
        id: { in: selectedStudents },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const studentMap = new Map(students.map(s => [s.id, s.name]));

    // Create assignments for each student
    const assignmentsData = selectedStudents.map((studentId: string) => ({
      classroomId,
      articleId,
      userId: studentId,
      title: title || null,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: Status.NOT_STARTED,
    }));

    // Check for existing assignments to avoid duplicates
    const existingAssignments = await prisma.assignment.findMany({
      where: {
        classroomId,
        articleId,
        userId: { in: selectedStudents },
      },
      select: {
        userId: true,
      },
    });

    const existingUserIds = new Set(existingAssignments.map(a => a.userId).filter(Boolean));
    const newAssignments = assignmentsData.filter(a => !existingUserIds.has(a.userId));

    if (newAssignments.length === 0) {
      return NextResponse.json(
        { message: "All assignments already exist" },
        { status: 200 }
      );
    }

    // Create new assignments
    const createdAssignments = await prisma.assignment.createMany({
      data: newAssignments,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: `${createdAssignments.count} assignments created successfully`,
        created: createdAssignments.count,
        skipped: selectedStudents.length - createdAssignments.count,
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
      // Update metadata for all assignments in this classroom+article combination
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

      const updatedAssignments = await prisma.assignment.updateMany({
        where: {
          classroomId,
          articleId,
        },
        data: filteredUpdates,
      });

      return NextResponse.json(
        { 
          message: "Assignment metadata updated successfully",
          updatedCount: updatedAssignments.count 
        },
        { status: 200 }
      );
    } else {
      // Update specific student assignment
      if (!studentId) {
        return NextResponse.json(
          { message: "Missing studentId for individual assignment update" },
          { status: 400 }
        );
      }

      const allowedFields = ["status", "title", "description", "dueDate"];
      const filteredUpdates: any = {};
      
      for (const key of allowedFields) {
        if (updates.hasOwnProperty(key)) {
          if (key === "dueDate" && updates[key]) {
            filteredUpdates[key] = new Date(updates[key]);
          } else if (key === "status" && typeof updates[key] === "string") {
            // Convert string status to enum
            filteredUpdates[key] = updates[key] as Status;
          } else {
            filteredUpdates[key] = updates[key];
          }
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return NextResponse.json(
          { message: "No valid fields to update" },
          { status: 400 }
        );
      }

      const updatedAssignment = await prisma.assignment.updateMany({
        where: {
          classroomId,
          articleId,
          userId: studentId,
        },
        data: filteredUpdates,
      });

      if (updatedAssignment.count === 0) {
        return NextResponse.json(
          { message: "Assignment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Assignment updated successfully" },
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

    let whereClause: any = {
      userId: studentId,
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
      whereClause.status = statusEnum;
    }

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      whereClause.OR = [
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
          whereClause.dueDate = { lt: today };
          break;
        case "today":
          whereClause.dueDate = { gte: today, lt: tomorrow };
          break;
        case "upcoming":
          whereClause.dueDate = { gte: tomorrow };
          break;
      }
    }

    // Debug: Let's see what assignments exist in general
    const allAssignments = await prisma.assignment.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
      },
      take: 5,
    });

    const totalCount = await prisma.assignment.count({
      where: whereClause,
    });

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        article: {
          select: {
            title: true,
            summary: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
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
      orderBy: {
        dueDate: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedAssignments: StudentAssignment[] = assignments.map((assignment) => ({
      id: assignment.id,
      classroomId: assignment.classroomId,
      articleId: assignment.articleId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : "",
      status: assignment.status === Status.NOT_STARTED ? 0 : 
              assignment.status === Status.IN_PROGRESS ? 1 : 
              assignment.status === Status.COMPLETED ? 2 : 0,
      createdAt: assignment.createdAt.toISOString(),
      userId: assignment.userId,
      displayName: assignment.user?.name || "Unknown User",
      teacherDisplayName: assignment.classroom?.teachers?.[0]?.teacher?.name || "Unknown Teacher",
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

    const deletedAssignments = await prisma.assignment.deleteMany({
      where: {
        classroomId,
        articleId,
        userId: { in: studentIds },
      },
    });

    if (deletedAssignments.count === 0) {
      return NextResponse.json(
        { message: "No assignments found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `${deletedAssignments.count} assignment(s) deleted successfully`,
        deletedCount: deletedAssignments.count,
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
