// user roles update
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
        return new Response(
            JSON.stringify({
            message: "Unauthorized",
            }),
            { status: 403 }
        );
        }
    
        const userId = session.user.id;
        const  reqData  = await req.json();
        const { role } = reqData;

        // Check if role is valid
        if (!Object.values(UserRole).includes(role)) {
            return new Response(
            JSON.stringify({
                message: "Invalid role",
            }),
            { status: 400 }
            );
        }
    
        const userDoc = db.collection("users").doc(userId);
        if (!(await userDoc.get()).exists) {
            return new Response(
            JSON.stringify({
                message: "User not found",
            }),
            { status: 404 }
            );
        }

        await userDoc.update({ role }); 
    
        // update user session
        session.user.role = role;
    
        return new Response(
        JSON.stringify({
            message: "success",
        }),
        { status: 200 }
        );
    } catch (error) {
        return new Response(
        JSON.stringify({
            message: error,
        }),
        { status: 500 }
        );
    }
    }

