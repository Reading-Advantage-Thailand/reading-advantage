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

export async function PATCH(req: Request,  context: z.infer<typeof routeContextSchema>) {
    
    try {
        // const url = new URL(req.url);
        // const studentId = url.searchParams.get('student');

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
const studentId = json.studentId;
const unenrollmentClassroom = json.student;


        // Fetch the classroom from the database
        const docRef = db.collection('classroom').doc(classroomId);
        const doc = await docRef.get();
        const data = doc.data();

        // Check if the classroom exists and the id matches
        if (!doc.exists || doc.id !== classroomId) {
            return new Response(JSON.stringify({
                message: 'Classroom not found or id does not match',
            }), { status: 404 })
        }

        // Update the classroom
        await docRef.update({
            student: unenrollmentClassroom,
        });
        
        return new Response(JSON.stringify({
            message: 'success',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}

