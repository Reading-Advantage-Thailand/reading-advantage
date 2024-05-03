// api classroom/[classroomId]/route.ts
import db from '@/configs/firestore-config';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import * as z from "zod"
import firebase from 'firebase-admin';

// update unenrollment classroom
const routeContextSchema = z.object({
    params: z.object({
        classroomId: z.string(),
    }),
})

export async function DELETE(req: Request,  context: z.infer<typeof routeContextSchema>) {
    
    try {
        const url = new URL(req.url);
        const studentId = url.searchParams.get('student');

        const { params } = routeContextSchema.parse(context);
        const classroomId = params.classroomId;

        const session = await getServerSession(authOptions);
        
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 });
        }
        const json = await req.json();
        const userId = session.user.id;
console.log('json', json);

        // Fetch the classroom from the database
        const docRef = db.collection('classroom').doc(classroomId);
        const doc = await docRef.get();
        const data = doc.data();
console.log('doc', doc);


        // Check if the classroom exists and the id matches
        if (!doc.exists || doc.id !== classroomId) {
            return new Response(JSON.stringify({
                message: 'Classroom not found or id does not match',
            }), { status: 404 })
        }

        // Check if the student is enrolled in the classroom
        // if (data && data.student) {
        //     const students: string[] = data.student;
        //     console.log('students', students);
            
        //     const index = students.indexOf(studentId!);
        //     if (index !== -1) {
                
        //         // await docRef.update({ students });
        //     } else {
        //         return new Response(JSON.stringify({
        //             message: 'Student not enrolled in this class',
        //         }), { status: 404 });
        //     }
        // }

        // Update the classroom
        // await docRef.delete();
        
        return new Response(JSON.stringify({
            message: 'success',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}

