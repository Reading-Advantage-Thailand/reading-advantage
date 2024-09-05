// api classroom/[classroomId]/route.ts
import db from '@/configs/firestore-config';
import { authOptions } from '@/lib/auth';
import { last } from 'lodash';
import { getServerSession } from 'next-auth';
import * as z from "zod"

// update student enrollment
const routeContextSchema = z.object({
    params: z.object({
        classroomId: z.string(),
    }),
})

const studentSchema = z.object({
    studentId: z.string(),
    lastActivity: z.string(),
});

export async function PATCH(req: Request,  context: z.infer<typeof routeContextSchema>) {
    
    try {
        const { params } = routeContextSchema.parse(context);
        const classroomId = params.classroomId;

        const session = await getServerSession(authOptions);
        
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 });
        }
        const json = await req.json();
        const newStudent = z.array(studentSchema).parse(json.student);

        // const enrollmentClassroom = {
        //     student: json.student,
        //     // lastActivity: json.lastActivity,
        // };
        // Fetch the classroom from the database
        const docRef = db.collection('classroom').doc(classroomId);
        const doc = await docRef.get();

        // Check if the classroom exists and the id matches
        if (!doc.exists || doc.id !== classroomId) {
            return new Response(JSON.stringify({
                message: 'Classroom not found or id does not match',
            }), { status: 404 })
        };

        const currentStudents = doc.data()?.student || [];
        const updatedStudents = mergeStudents(currentStudents, newStudent);
        // Update the classroom
        // await docRef.update(enrollmentClassroom);

        await docRef.update({ student: updatedStudents });
        
        return new Response(JSON.stringify({
            message: 'success',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}

function mergeStudents(currentStudents: any[], newStudents: z.infer<typeof studentSchema>[]) {
    const studentMap = new Map(currentStudents.map(student => [student.studentId, student]));
  
    newStudents.forEach(newStudent => {
      if (studentMap.has(newStudent.studentId)) {
        // Update lastActivity if the student already exists
        studentMap.get(newStudent.studentId)!.lastActivity = newStudent.lastActivity;
      } else {
        // Add new student if they don't exist
        studentMap.set(newStudent.studentId, newStudent);
      }
    });
  
    return Array.from(studentMap.values());
  }

// export async function GET(req: Request,  context: z.infer<typeof routeContextSchema>) {
//     try {
//         const { params } = routeContextSchema.parse(context);
//         const classroomId = params.classroomId;
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             return new Response(
//                 JSON.stringify({
//                     message: "Unauthorized",
//                 }),
//                 { status: 403 }
//             );
//         }
        
//         const userId = session.user.id;
//         const userRef = db.collection('users').where('role', '==', 'student');
//         const snapshot = await userRef.get();
//         const students = snapshot.docs.map(doc => doc.data());
    
//         return new Response(
//         JSON.stringify({
//             students: students,
//         }),
//         { status: 200 }
//         );
//     } catch (error) {
//         return new Response(
//         JSON.stringify({
//             message: error,
//         }),
//         { status: 500 }
//         );
//     }
//     }
