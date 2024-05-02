// api classroom/[classroomId]/route.ts
import db from '@/configs/firestore-config';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import * as z from "zod"

// update classroom
const routeContextSchema = z.object({
    params: z.object({
        classroomId: z.string(),
    }),
})

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
        const userId = session.user.id;

        const classroom = {
            classroomName: json.classroomName,
            grade: json.grade,
        };

        // Fetch the classroom from the database
        const docRef = db.collection('classroom').doc(classroomId);
        const doc = await docRef.get();

        // Check if the classroom exists and the id matches
        if (!doc.exists || doc.id !== classroomId) {
            return new Response(JSON.stringify({
                message: 'Classroom not found or id does not match',
            }), { status: 404 })
        }

        // Update the classroom
        await docRef.update(classroom);
        
        return new Response(JSON.stringify({
            message: 'success',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}

// delete classroom
export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {
    try {
        const { params } = routeContextSchema.parse(context);
        const classroomId = params.classroomId;

        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 });
        }

        // Fetch the classroom from the database
        const docRef = db.collection('classroom').doc(classroomId);
        // console.log('docRef', docRef);
        
        const doc = await docRef.get();

        // Check if the classroom exists and the id matches
        if (!doc.exists || doc.id !== classroomId) {
            return new Response(JSON.stringify({
                message: 'Classroom not found or id does not match',
            }), { status: 404 })
        }

        // Delete the classroom
        await docRef.delete();
        
        return new Response(JSON.stringify({
            message: 'Classroom deleted',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    } 
}

