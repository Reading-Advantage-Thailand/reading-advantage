// user/[userId]
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import * as z from "zod"

const userLevelSchema = z.object({
    level: z.number(),
})

// update user level
export async function PATCH(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        console.log('sessionxxxx', session);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }

        const json = await req.json();
        const body = JSON.parse(json.body);
        const level = body.level;
        const userId = session.user.id;

        await db.collection('users')
            .doc(userId)
            .update({
                level: level,
            });

        // update user session
        session.user.level = level;

        return new Response(JSON.stringify({
            message: 'success',
        }), { status: 200 })
    } catch (error) {
        console.log('error', error);
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}