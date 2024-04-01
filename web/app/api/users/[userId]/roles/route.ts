// user roles update
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
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
        console.log('reqData', reqData);
        
        const role  = reqData.selectedRole;
        console.log('role', role);

        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({ role: role });
          
            console.log('User role updated');
          } catch (error) {
            console.error('Failed to update user role', error);
          }
    
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

// user roles get
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
    
        const userId = session.user.id;
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
    console.log('userData', userData);
    
        return new Response(
        JSON.stringify({
            // role: userData.role,
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


