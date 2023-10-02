// user/[userId]
import { db } from "@/configs/firestore-config";
import { authOptions } from "@/lib/nextauth";
import { get } from "lodash";
import { getServerSession } from "next-auth";

// update user level 
export async function PATCH(req: Request, res: Response) {
    const { level } = await req.json();

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", { status: 403 })
        }

        const userId = get(session, 'user.id');

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