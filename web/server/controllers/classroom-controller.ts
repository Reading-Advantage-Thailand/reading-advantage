import { prisma } from "@/lib/prisma";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { getAllLicenses } from "./license-controller";
import { getCurrentUser } from "@/lib/session";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

interface RequestContext {
  params: {
    classroomId: string;
  };
}

interface License {
  id: string;
  school_name?: string;
}

interface User {
  xp?: number;
}

interface SchoolXP {
  school: string;
  xp: number;
}

interface Student {
  studentId?: string;
  email?: string;
  lastActivity?: string;
  profile?: {
    emailAddress?: string;
  };
}

interface Course {
  teacherId?: string | string[];
  userId?: string;
  classCode?: string;
  enrollmentCode?: string;
  classroomName?: string;
  name?: string;
  grade?: string;
  classroom?: {
    student?: Student[];
  };
  title?: string;
  creationTime?: string;
  alternateLink?: string;
  studentCount?: Student[];
  id?: string;
}

interface Classroom {
  teacherId: string | string[];
  archived: boolean;
  classCode: string;
  classroomName: string;
  grade: string;
  student: Student[];
  title: string;
  createdAt: Date;
  importedFromGoogle: boolean;
  alternateLink: string;
  license_id: string;
  googleClassroomId?: string;
}

// get all classrooms
// for get all -> GET /api/classroom
// for get all students -> GET /api/classroom/students
// for get by teacher -> GET /api/classroom?teacherId=abc123

export async function getAllStudentList(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherLicensesFromTable = await prisma.licenseOnUser.findMany({
      where: {
        userId: user.id,
      },
      select: {
        licenseId: true,
      },
    });

    const teacherData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { licenseId: true },
    });

    const licenseIdsFromTable = teacherLicensesFromTable.map(
      (license) => license.licenseId
    );
    const allLicenseIds = teacherData?.licenseId
      ? [...licenseIdsFromTable, teacherData.licenseId]
      : licenseIdsFromTable;

    const uniqueLicenseIds = [...new Set(allLicenseIds)];

    const students = await prisma.user.findMany({
      where: {
        role: {
          in: ["STUDENT", "USER"],
        },
        OR: [
          {
            licenseOnUsers: {
              some: {
                licenseId: {
                  in: uniqueLicenseIds,
                },
              },
            },
          },
          {
            licenseId: {
              in: uniqueLicenseIds,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        cefrLevel: true,
        createdAt: true,
        updatedAt: true,
        licenseId: true,
        licenseOnUsers: {
          select: {
            licenseId: true,
          },
        },
      },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student list:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function getClassroom(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownedClassrooms = await prisma.classroom.findMany({
      where: {
        teacherId: user.id,
        archived: {
          not: true,
        },
      },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const coTeacherClassrooms = (await prisma.$queryRaw`
      SELECT c.*, 
             t.id as teacher_id, t.name as teacher_name,
             ct.role as user_role, ct."createdAt" as joined_at
      FROM "classrooms" c
      JOIN "classroomTeachers" ct ON c.id = ct.classroom_id
      LEFT JOIN "users" t ON c.teacher_id = t.id
      WHERE ct.teacher_id = ${user.id}
        AND c.archived != true
      ORDER BY c."createdAt" DESC
    `) as any[];

    const coTeacherClassroomIds = coTeacherClassrooms.map((c: any) => c.id);
    const coTeacherStudents =
      coTeacherClassroomIds.length > 0
        ? await prisma.classroomStudent.findMany({
            where: {
              classroomId: {
                in: coTeacherClassroomIds,
              },
            },
            include: {
              student: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          })
        : [];

    const transformedOwnedData = ownedClassrooms.map((classroom) => ({
      id: classroom.id,
      classroomName: classroom.classroomName,
      classCode: classroom.classCode,
      grade: classroom.grade?.toString(),
      archived: classroom.archived || false,
      title: classroom.classroomName,
      importedFromGoogle: false,
      alternateLink: "",
      createdAt: classroom.createdAt,
      createdBy: classroom.teacher,
      isOwner: true,
      teachers: [
        {
          teacherId: classroom.teacher?.id || "",
          name: classroom.teacher?.name || "",
          role: "OWNER" as const,
          joinedAt: classroom.createdAt,
        },
      ],
      student: classroom.students.map((cs) => ({
        studentId: cs.student.id,
        email: cs.student.email,
        lastActivity: cs.createdAt,
      })),
    }));

    const transformedCoTeacherData = coTeacherClassrooms.map(
      (classroom: any) => {
        const studentsForClassroom = coTeacherStudents.filter(
          (cs) => cs.classroomId === classroom.id
        );

        return {
          id: classroom.id,
          classroomName: classroom.classroom_name,
          classCode: classroom.class_code,
          grade: classroom.grade?.toString(),
          archived: classroom.archived || false,
          title: classroom.classroom_name,
          importedFromGoogle: false,
          alternateLink: "",
          createdAt: classroom.createdAt,
          createdBy: {
            id: classroom.teacher_id,
            name: classroom.teacher_name,
          },
          isOwner: false,
          teachers: [
            {
              teacherId: classroom.teacher_id || "",
              name: classroom.teacher_name || "",
              role: "OWNER" as const,
              joinedAt: classroom.createdAt,
            },
          ],
          student: studentsForClassroom.map((cs) => ({
            studentId: cs.student.id,
            email: cs.student.email,
            lastActivity: cs.createdAt,
          })),
        };
      }
    );

    const allClassrooms = [
      ...transformedOwnedData,
      ...transformedCoTeacherData,
    ];
    const uniqueClassrooms = allClassrooms.filter(
      (classroom, index, self) =>
        index === self.findIndex((c) => c.id === classroom.id)
    );

    return NextResponse.json(
      {
        message: "success",
        data: uniqueClassrooms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    console.error(error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function getStudentClassroom(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentClassrooms = await prisma.classroomStudent.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        classroom: true,
      },
    });

    const classroomId =
      studentClassrooms.length > 0 ? studentClassrooms[0].classroom.id : null;

    return NextResponse.json(
      {
        message: "success",
        data: classroomId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    console.error(error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// get all classrooms students
export async function getClassroomStudent(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: user.id },
      select: { licenseId: true },
    });

    if (!teacher || !teacher.licenseId) {
      return NextResponse.json(
        { error: "Teacher license not found" },
        { status: 404 }
      );
    }

    const students = await prisma.user.findMany({
      where: {
        role: {
          in: ["STUDENT", "USER"],
        },
        licenseId: teacher.licenseId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        cefrLevel: true,
        createdAt: true,
        updatedAt: true,
        licenseId: true,
      },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// get enroll classroom
export async function getEnrollClassroom(req: ExtendedNextRequest) {
  try {
    const params = req.nextUrl.searchParams.get("studentId");
    const user = await getCurrentUser();

    if (!params) {
      return NextResponse.json(
        { messages: "Invalid user ID" },
        { status: 501 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentData = await prisma.user.findUnique({
      where: { id: params },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        cefrLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!studentData) {
      return NextResponse.json(
        { messages: "Student not found" },
        { status: 404 }
      );
    }

    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: user.id,
        archived: { not: true },
        students: {
          none: {
            studentId: params,
          },
        },
      },
      include: {
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const filteredClassrooms = classrooms.map((classroom) => ({
      id: classroom.id,
      classroomName: classroom.classroomName,
      classCode: classroom.classCode,
      grade: classroom.grade?.toString(),
      archived: classroom.archived,
      teacherId: classroom.teacherId,
      importedFromGoogle: false,
      student: classroom.students.map((cs) => ({
        studentId: cs.student.id,
        email: cs.student.email,
        lastActivity: cs.createdAt,
      })),
    }));

    return NextResponse.json(
      {
        student: {
          ...studentData,
          display_name: studentData.name,
          last_activity: studentData.updatedAt,
        },
        classroom: filteredClassrooms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getEnrollClassroom:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// get unenroll classroom
export async function getUnenrollClassroom(req: ExtendedNextRequest) {
  try {
    const params = req.nextUrl.searchParams.get("studentId");
    const user = await getCurrentUser();

    if (!params) {
      return NextResponse.json(
        { messages: "Invalid user ID" },
        { status: 501 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentData = await prisma.user.findUnique({
      where: { id: params },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        cefrLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!studentData) {
      return NextResponse.json(
        { messages: "Student not found" },
        { status: 404 }
      );
    }

    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: user.id,
        archived: { not: true },
        students: {
          some: {
            studentId: params,
          },
        },
      },
      include: {
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const filteredClassrooms = classrooms.map((classroom) => ({
      id: classroom.id,
      classroomName: classroom.classroomName,
      classCode: classroom.classCode,
      grade: classroom.grade?.toString(),
      archived: classroom.archived,
      teacherId: classroom.teacherId,
      importedFromGoogle: false,
      student: classroom.students.map((cs) => ({
        studentId: cs.student.id,
        email: cs.student.email,
        lastActivity: cs.createdAt,
      })),
    }));

    return NextResponse.json(
      {
        student: {
          ...studentData,
          display_name: studentData.name,
          last_activity: studentData.updatedAt,
        },
        classroom: filteredClassrooms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getUnenrollClassroom:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function getStudentInClassroom(
  req: ExtendedNextRequest,
  { params }: { params: { classroomId: string } }
) {
  try {
    const { classroomId } = params;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                level: true,
                cefrLevel: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const filteredUsers = classroom.students.map((cs) => ({
      ...cs.student,
      display_name: cs.student.name,
      last_activity: cs.createdAt,
    }));

    const classroomDoc = {
      id: classroom.id,
      classroomName: classroom.classroomName,
      classCode: classroom.classCode,
      teacherId: classroom.teacherId,
      archived: classroom.archived,
      grade: classroom.grade?.toString(),
      createdAt: classroom.createdAt,
      updatedAt: classroom.updatedAt,
      importedFromGoogle: false,
      googleClassroomId: null,
    };

    return NextResponse.json(
      { studentInClass: filteredUsers, classroom: classroomDoc },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// update student classroom
export async function updateStudentClassroom(req: ExtendedNextRequest) {
  try {
    const json = await req.json();
    const name = json.name;
    const studentId = json.studentId;

    await prisma.user.update({
      where: { id: studentId },
      data: { name: name },
    });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// get all classrooms teachers
export async function getClassroomTeacher(req: ExtendedNextRequest) {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ teachers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// create classroom
export async function createdClassroom(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json: { classroom?: Course; courses?: Course[] } = await req.json();
    const isImportedFromGoogle: boolean = Array.isArray(json.courses);
    const courses: Course[] = isImportedFromGoogle
      ? json.courses!
      : [json.classroom!];

    for (const data of courses.filter((course): course is Course => !!course)) {
      const classCode =
        data.classCode || data.enrollmentCode || generateClassCode();

      // Use raw SQL to create classroom with new schema
      const classroomResult = await prisma.$queryRaw`
        INSERT INTO classrooms (id, classroom_name, created_by, class_code, archived, grade, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${data.classroomName || data.name || ""}, ${user.id}, ${classCode}, false, ${data.grade ? parseInt(data.grade) : null}, ${data.creationTime ? new Date(data.creationTime) : new Date()}, NOW())
        RETURNING *
      `;

      const classroom = (classroomResult as any[])[0];

      // Add creator as OWNER in ClassroomTeacher table
      await prisma.$queryRaw`
        INSERT INTO "classroomTeachers" (id, teacher_id, classroom_id, role, "createdAt")
        VALUES (gen_random_uuid(), ${user.id}, ${classroom.id}, 'OWNER'::"TeacherRole", NOW())
      `;

      if (isImportedFromGoogle && data.studentCount) {
        for (const student of data.studentCount) {
          if (student.profile?.emailAddress) {
            const userRecord = await prisma.user.findUnique({
              where: { email: student.profile.emailAddress },
            });

            if (userRecord) {
              await prisma.classroomStudent.create({
                data: {
                  classroomId: classroom.id,
                  studentId: userRecord.id,
                },
              });
            }
          }
        }
      } else if (!isImportedFromGoogle && data.classroom?.student) {
        for (const student of data.classroom.student) {
          if (student.studentId) {
            await prisma.classroomStudent.create({
              data: {
                classroomId: classroom.id,
                studentId: student.studentId,
              },
            });
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function generateClassCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// achive classroom
export async function achivedClassroom(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const { archived } = await req.json();

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    await prisma.classroom.update({
      where: { id: classroomId },
      data: { archived },
    });

    return NextResponse.json(
      { message: "success updated archived status" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// update classroom
export async function updateClassroom(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const { classroomName, grade } = await req.json();

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    // Update the classroom
    await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        classroomName,
        grade: grade ? parseInt(grade) : null,
      },
    });

    return NextResponse.json({ message: "success updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// delete classroom
export async function deleteClassroom(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    await prisma.classroom.delete({
      where: { id: classroomId },
    });

    return NextResponse.json({ message: "success deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function patchClassroomEnroll(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  const studentSchema = z.object({
    studentId: z.string(),
    lastActivity: z.string(),
  });

  try {
    const json = await req.json();
    const newStudents = z.array(studentSchema).parse(json.student);

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    for (const student of newStudents) {
      const existingEnrollment = await prisma.classroomStudent.findFirst({
        where: {
          studentId: student.studentId,
        },
        include: {
          classroom: true,
        },
      });

      if (existingEnrollment) {
        return NextResponse.json(
          {
            message: `Student is already enrolled in classroom: ${existingEnrollment.classroom.classroomName}`,
            error: "ALREADY_ENROLLED",
          },
          { status: 400 }
        );
      }

      await prisma.classroomStudent.upsert({
        where: {
          classroomId_studentId: {
            classroomId: classroomId,
            studentId: student.studentId,
          },
        },
        update: {},
        create: {
          classroomId: classroomId,
          studentId: student.studentId,
        },
      });
    }

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error enrolling students:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function patchClassroomUnenroll(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const json = await req.json();
    const studentId = json.studentId;

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    await prisma.classroomStudent.delete({
      where: {
        classroomId_studentId: {
          classroomId: classroomId,
          studentId: studentId,
        },
      },
    });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error unenrolling student:", error);

    if (error instanceof Error && error.message.includes("P2025")) {
      return NextResponse.json(
        { message: "Student not found in classroom" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function getClassXp(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const licenseId = searchParams.get("licenseId");
    const timeRange = searchParams.get("timeRange") || "year";

    if (!year) {
      return NextResponse.json(
        { message: "Year parameter is required" },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    let startDate: Date;
    let endDate: Date;

    const now = new Date();
    switch (timeRange) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        endDate = now;
        break;
      case "year":
      default:
        startDate = new Date(yearNum, 0, 1);
        endDate = new Date(yearNum + 1, 0, 1);
        break;
    }

    if (licenseId) {
      const license = await prisma.license.findUnique({
        where: { id: licenseId },
        include: {
          licenseUsers: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!license) {
        return NextResponse.json(
          { message: `License ${licenseId} not found` },
          { status: 404 }
        );
      }

      const userIds = license.licenseUsers.map((lu) => lu.userId);

      const classrooms = await prisma.classroom.findMany({
        where: {
          students: {
            some: {
              studentId: { in: userIds },
            },
          },
        },
        include: {
          students: {
            include: {
              student: {
                include: {
                  xpLogs: {
                    where: {
                      createdAt: {
                        gte: startDate,
                        lt: endDate,
                      },
                    },
                    select: {
                      xpEarned: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const classroomXpMap: {
        [classroomId: string]: { name: string; xp: number };
      } = {};

      classrooms.forEach((classroom) => {
        let totalClassroomXp = 0;

        classroom.students.forEach((classroomStudent) => {
          if (userIds.includes(classroomStudent.studentId)) {
            const studentXp = classroomStudent.student.xpLogs.reduce(
              (sum, log) => sum + log.xpEarned,
              0
            );
            totalClassroomXp += studentXp;
          }
        });

        if (totalClassroomXp > 0) {
          classroomXpMap[classroom.id] = {
            name: classroom.classroomName || `Classroom ${classroom.id}`,
            xp: totalClassroomXp,
          };
        }
      });

      const classroomData = Object.values(classroomXpMap);
      const mostActive = classroomData.sort((a, b) => b.xp - a.xp).slice(0, 5);
      const leastActive = classroomData.sort((a, b) => a.xp - b.xp).slice(0, 5);

      const data = {
        dataMostActive: {
          [timeRange]: mostActive,
        },
        dataLeastActive: {
          [timeRange]: leastActive,
        },
      };

      return NextResponse.json({
        year,
        licenseId,
        timeRange,
        data,
      });
    }
    return NextResponse.json(
      { message: "Please specify a licenseId parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getTopSchoolsXp(req: NextRequest): Promise<NextResponse> {
  try {
    const licenses = await prisma.license.findMany({
      include: {
        licenseUsers: {
          include: {
            user: {
              include: {
                xpLogs: {
                  select: {
                    xpEarned: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const schoolXpData: { school: string; xp: number }[] = [];

    licenses.forEach((license) => {
      let totalXp = 0;

      license.licenseUsers.forEach((licenseUser) => {
        const userXp = licenseUser.user.xpLogs.reduce(
          (sum, log) => sum + log.xpEarned,
          0
        );
        totalXp += userXp;
      });

      if (totalXp > 0) {
        schoolXpData.push({
          school: license.schoolName,
          xp: totalXp,
        });
      }
    });

    const topSchools = schoolXpData.sort((a, b) => b.xp - a.xp).slice(0, 10);

    return NextResponse.json({ data: topSchools }, { status: 200 });
  } catch (error) {
    console.error("Error fetching top schools XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getClassXpPerStudents(
  req: NextRequest,
  ctx: RequestContext
) {
  try {
    const classroomId = ctx.params?.classroomId;
    if (!classroomId) {
      return NextResponse.json(
        { message: "Missing classroomId" },
        { status: 400 }
      );
    }

    // Get classroom with students using Prisma
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                xp: true,
                xpLogs: {
                  select: {
                    xpEarned: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    const result: Record<string, any> = {};

    // Calculate XP for each student for all periods
    for (const cs of classroom.students) {
      const student = cs.student;
      const displayName = student.name || student.id;

      const now = new Date();

      // Calculate date ranges
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);

      // Filter and calculate XP for each period
      const todayLogs = student.xpLogs.filter(
        (log) => log.createdAt >= todayStart
      );
      const weekLogs = student.xpLogs.filter(
        (log) => log.createdAt >= weekStart
      );
      const monthLogs = student.xpLogs.filter(
        (log) => log.createdAt >= monthStart
      );

      result[displayName] = {
        today: todayLogs.reduce((sum, log) => sum + log.xpEarned, 0),
        week: weekLogs.reduce((sum, log) => sum + log.xpEarned, 0),
        month: monthLogs.reduce((sum, log) => sum + log.xpEarned, 0),
        allTime: student.xp,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function addCoTeacher(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { teacherEmail, role = "CO_TEACHER" } = body;

    if (!teacherEmail) {
      return NextResponse.json(
        { error: "Teacher email is required" },
        { status: 400 }
      );
    }

    const classroom = await prisma.$queryRaw`
      SELECT * FROM classrooms 
      WHERE id = ${classroomId} 
      AND (teacher_id = ${user.id} OR created_by = ${user.id})
    `;

    if ((classroom as any[]).length === 0) {
      return NextResponse.json(
        { error: "Only classroom creator can add co-teachers" },
        { status: 403 }
      );
    }

    const teacher = await prisma.user.findUnique({
      where: { email: teacherEmail },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json(
        { error: "User must have TEACHER role" },
        { status: 400 }
      );
    }

    const existingTeacher = await prisma.$queryRaw`
      SELECT * FROM "classroomTeachers" 
      WHERE classroom_id = ${classroomId} AND teacher_id = ${teacher.id}
    `;

    if ((existingTeacher as any[]).length > 0) {
      return NextResponse.json(
        { error: "Teacher is already in this classroom" },
        { status: 400 }
      );
    }

    await prisma.$queryRaw`
      INSERT INTO "classroomTeachers" (id, teacher_id, classroom_id, role, "createdAt")
      VALUES (gen_random_uuid(), ${teacher.id}, ${classroomId}, ${role}::"TeacherRole", NOW())
    `;

    return NextResponse.json(
      {
        message: "Co-teacher added successfully",
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding co-teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function removeCoTeacher(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { teacherId } = body;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const classroom = await prisma.$queryRaw`
      SELECT * FROM classrooms 
      WHERE id = ${classroomId} 
      AND (teacher_id = ${user.id} OR created_by = ${user.id})
    `;

    if ((classroom as any[]).length === 0) {
      return NextResponse.json(
        { error: "Only classroom creator can remove co-teachers" },
        { status: 403 }
      );
    }

    const teacherInClassroom = await prisma.$queryRaw`
      SELECT ct.*, u.name 
      FROM "classroomTeachers" ct
      JOIN users u ON ct.teacher_id = u.id
      WHERE ct.classroom_id = ${classroomId} AND ct.teacher_id = ${teacherId}
    `;

    if ((teacherInClassroom as any[]).length === 0) {
      return NextResponse.json(
        { error: "Teacher not found in this classroom" },
        { status: 404 }
      );
    }

    const teacher = (teacherInClassroom as any[])[0];
    if (teacher.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove classroom owner" },
        { status: 400 }
      );
    }

    await prisma.$queryRaw`
      DELETE FROM "classroomTeachers" 
      WHERE classroom_id = ${classroomId} AND teacher_id = ${teacherId}
    `;

    return NextResponse.json(
      {
        message: "Co-teacher removed successfully",
        removedTeacher: {
          id: teacherId,
          name: teacher.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing co-teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all teachers in a classroom
export async function getClassroomTeachers(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classroom = await prisma.$queryRaw`
      SELECT c.*, 
             t.id as teacher_id, t.name as teacher_name, t.email as teacher_email
      FROM classrooms c
      LEFT JOIN users t ON c.teacher_id = t.id
      WHERE c.id = ${classroomId} 
      AND (c.teacher_id = ${user.id} OR c.created_by = ${user.id})
    `;

    if ((classroom as any[]).length === 0) {
      return NextResponse.json(
        { error: "Classroom not found or access denied" },
        { status: 404 }
      );
    }

    const classroomData = (classroom as any[])[0];

    const newTeachers = await prisma.$queryRaw`
      SELECT 
        ct.role,
        ct."createdAt" as joined_at,
        u.id,
        u.name,
        u.email,
        true as is_from_new_table
      FROM "classroomTeachers" ct
      JOIN users u ON ct.teacher_id = u.id
      WHERE ct.classroom_id = ${classroomId}
      ORDER BY 
        CASE WHEN ct.role = 'OWNER' THEN 0 ELSE 1 END,
        ct."createdAt" ASC
    `;

    let teachers;
    if ((newTeachers as any[]).length === 0) {
      teachers = [
        {
          id: classroomData.teacher_id || "",
          name: classroomData.teacher_name || "Unknown",
          email: classroomData.teacher_email || "",
          role: "OWNER",
          joined_at: classroomData.createdAt,
          is_creator: true,
        },
      ];
    } else {
      teachers = (newTeachers as any[]).map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        role: t.role,
        joined_at: t.joined_at,
        is_creator: t.role === "OWNER",
      }));
    }

    return NextResponse.json(
      {
        classroomId,
        teachers: teachers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting classroom teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
