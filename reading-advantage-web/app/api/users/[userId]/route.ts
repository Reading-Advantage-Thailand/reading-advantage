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
        if (!session) {
            return new Response("Unauthorized", { status: 403 })
        }
        const userId = session.user.id;

        const json = await req.json();
        const body = userLevelSchema.parse(json);
        const level = body.level;

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
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}