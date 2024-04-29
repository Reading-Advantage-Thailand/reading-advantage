import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// get user info
// export async function GET(req: Request, res: Response) {
//     try {
//       const session = await getServerSession(authOptions);
//       if (!session) {
//         return new Response(
//           JSON.stringify({
//             message: "Unauthorized",
//           }),
//           { status: 403 }
//         );
//       }
  
//       const userId = session.user.id;
  
//       const user = await db.collection("users").doc(userId).get();
  
//       if (!user.exists) {
//         return new Response(
//           JSON.stringify({
//             message: "User not found",
//           }),
//           { status: 404 }
//         );
//       }
  
//       return new Response(
//         JSON.stringify({
//           message: "success",
//           data: user.data(),
//         }),
//         { status: 200 }
//       );
//     } catch (error) {
//       return new Response(
//         JSON.stringify({
//           message: error,
//         }),
//         { status: 500 }
//       );
//     }
//   }

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
        const userRef = db.collection('users').where('role', 'array-contains', 'STUDENT');
        const snapshot = await userRef.get();
        const students = snapshot.docs.map(doc => doc.data());
    
        return new Response(
        JSON.stringify({
            students: students,
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

