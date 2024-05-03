// api classrooms
import db from '@/configs/firestore-config';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import * as z from "zod"

// get all classrooms
export async function GET(
    req: Request, 
    res: Response,
    ) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }
        const userId = session.user.id;
        const classroomsSnapshot = await db.collection('classroom').get();
        const classrooms: FirebaseFirestore.DocumentData[] = [];
        classroomsSnapshot.forEach((doc) => {
            const classroom = doc.data();
            classroom.id = doc.id;
            classrooms.push(classroom);
        });
        classrooms.sort((a, b) => b.createdAt - a.createdAt);
        
        return new Response(JSON.stringify({
            message: 'success',
            data: classrooms
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}

// create classroom
export async function POST(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }
        const json = await req.json();
        const body = json.classroom;
        // console.log('body', body);
        

        const userId = session.user.id;
        const classroom = {
            teacherId: userId,
            classCode: body.classCode,
            classroomName: body.classroomName,
            description: body.description,
            grade: body.grade,
            // student: body.student.map((student: any) => {
            //     return {
            //         studentId: student.studentId,
            //         lastActivity: student.lastActivity,
            //     }
            // }),
            title: body.title,
            createdAt: new Date(),
        };
        await db.collection('classroom').add(classroom);
        return new Response(JSON.stringify({
            message: 'success',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}
