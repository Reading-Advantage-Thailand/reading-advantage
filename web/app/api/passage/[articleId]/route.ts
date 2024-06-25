// import db from "@/configs/firestore-config";
// import { authOptions } from "@/lib/auth";
// import { getServerSession } from "next-auth";

// export async function DELETE(req: Request, res: Response) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session) {
//         return new Response(
//             JSON.stringify({
//             message: "Unauthorized",
//             }),
//             { status: 403 }
//         );
//         }
        
//         const userId = session.user.id;
//         const userRole = session.user.role;
//         // const articleId = req.params.id;
//         const articlesRef = db.collection('new-articles');
//         const snapshot = await articlesRef.get();
//         const articles = snapshot.docs.map(doc => doc.data());

//         if (!userRole.includes("SYSTEM")) {
//         return new Response(
//             JSON.stringify({
//             message: "Unauthorized",
//             }),
//             { status: 403 }
//         );
//         }

//         return new Response(
//         JSON.stringify({
//             message: "Article deleted",
//         }),
//         { status: 200 }
//         );
//     } catch (error) {
//         return new Response(
//         JSON.stringify({
//             message: error,
//         }),
//         { status: 500 }
//         );
//     }
// }