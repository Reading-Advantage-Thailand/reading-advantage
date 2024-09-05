// api classroom/[classroomId]/archived/route.ts

import db from '@/configs/firestore-config';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import * as z from "zod"

// update classroom archived
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
        
        const classroom = {
            archived: json.archived,
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
            message: 'success updated archived status', 
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}
