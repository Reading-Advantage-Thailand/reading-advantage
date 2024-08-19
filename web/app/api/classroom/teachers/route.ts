import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { log } from "console";
import { getServerSession } from "next-auth";

  export async function GET(req: Request, res: Response) {
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
        
        const userRef = db.collection('users').where('role', '==', 'teacher');
        const snapshot = await userRef.get();
        const teachers = snapshot.docs.map(doc => doc.data());
    
        return new Response(
        JSON.stringify({
            teachers: teachers,
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

