import ClassRoster from "@/components/teacher/class-roster";
import React from "react";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RosterPage(params: {
  params: {classroomId: string;}
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === "TEACHER") {
    return redirect("/teacher/my-classes");
  }

  //get all classroom data from database
  async function getAllClassroom() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom/`,
        {
          method: "GET",
          headers: headers(),
        }
      );

      return res.json();
    } catch (error) {
      console.error("Failed to parse JSON", error);
    }
  }
  const allClassroom = await getAllClassroom();

  // get student role data from database
  async function getAllStudentData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom/students`,
        {
          method: "GET",
          headers: headers(),
        }
      );

      return res.json();
    } catch (error) {
      console.error("Failed to parse JSON", error);
    }
  }
  const allStudent = await getAllStudentData();

  // get teacher role data from database
  async function getAllTeachersData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom/teachers`,
        {
          method: "GET",
          headers: headers(),
        }
      );

      return res.json();
    } catch (error) {
      console.error("Failed to parse JSON", error);
    }
  }
  const allTeachers = await getAllTeachersData();

  const teacherId = () => {
    let teacherId: String[] = [];
    allTeachers.teachers.forEach((teacher: { id: string; role: any }) => {
      if (teacher.role.includes("TEACHER") && teacher.id === user.id) {
        teacherId.push(teacher.id);
      }
    });
    return teacherId;
  };
  const teacher = teacherId();

  //get student in each class
  const getStudentInEachClass = (classroomId: string) => {
    let studentInEachClass: any[] = [];
    allClassroom.data.forEach(
      (classroom: {
        student: any;
        archived: boolean;
        teacherId: string;
        classroomName: string;
        id: string;
      }) => {
        if (
          !classroom.archived &&
          classroom.teacherId === teacher[0] &&
          classroom.id === classroomId
        ) {
          if (classroom.student) {
            classroom.student.forEach((students: { studentId: string }) => {
              studentInEachClass.push(students.studentId);
            });
          } else {
            studentInEachClass.push("No student in this class");
           }  
        }
      }
    );
    return studentInEachClass;
  };
  const studentInEachClass = getStudentInEachClass(params.params.classroomId);

  //compare student in each class and all student
  const getMatchedStudents = () => {
    let matchedStudents: any[] = [];
    allStudent.students.forEach((student: { id: string }) => {
      studentInEachClass.forEach((studentId: string) => {
        if (student.id === studentId) {
          matchedStudents.push(student);
        }
      });
    });
    return matchedStudents;
  };
  const matchedStudents = getMatchedStudents();

  // get classroom name
  const getClassroomName = (classroomId: string) => {
    let classrooms: any[] = [];
    allClassroom.data.forEach((classroom: { id: string }) => {
      if (classroom.id === classroomId) {
        classrooms.push(classroom);
      }
    });
    return classrooms;
  };
  const classrooms = getClassroomName(params.params.classroomId);

  // combine student in each class and classroom name
  const studentsMapped = classrooms.flatMap((classStudent) =>
    classStudent.student?
    classStudent.student.map(
      (studentData: { studentId: string; lastActivity: any }) => {
        const matchedStudent = matchedStudents.find(
          (s) => s.id === studentData.studentId
        );
        return {
          studentId: studentData.studentId,
          lastActivity: studentData.lastActivity,
          studentName: matchedStudent ? matchedStudent.name : "Unknown",
          classroomName: classStudent.classroomName,
          classroomId: classStudent.id,
          email: matchedStudent ? matchedStudent.email : "Unknown",
        };
      }
    ): []
  );

  return (
    <div>
      <ClassRoster studentInClass={studentsMapped} classrooms={classrooms}/>
    </div>
  );
}
