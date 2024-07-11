// original
// import db from "@/configs/firestore-config";
// import { authOptions } from "@/lib/auth";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: Request, res: Response) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return new Response(
//         JSON.stringify({
//           message: "Unauthorized",
//         }),
//         { status: 403 }
//       );
//     }
//     let results: any[] = [];

//     const userId = session.user.id;
//     const articlesRef = db.collection("new-articles");
//     const snapshot = await articlesRef.get();
//     const articles = snapshot.docs.map((doc) => doc.data());

//     for (const article of articles) {
//       if (
//         typeof article.id === "string" &&
//         article.id.trim() !== "" &&
//         article.id !== undefined
//       ) {
//         const articleRecord = await db
//           .collection("users")
//           .doc(userId)
//           .collection("article-records")
//           .doc(article.id)
//           .get();

//         // If the article record exists and is the same as the article, add is_approved field to the article
//         if (
//           articleRecord.data() !== undefined &&
//           articleRecord.data()?.id === article.id &&
//           !results.includes(articleRecord.data())
//         ) {
//           results.push({ ...article, is_approved: true });
//         } else {
//           results.push(article);
//         }
//       }
//     }

//     return new Response(
//       JSON.stringify({
//         passages: results,
//       }),
//       { status: 200 }
//     );
//   } catch (error: any) {
//     return new Response(
//       JSON.stringify({
//         message: "Internal server error",
//         error: error.message || error.toString(),
//       }),
//       { status: 500 }
//     );
//   }
// }

// test 2
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import  db  from "@/configs/firestore-config";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    console.log('url', url);
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;
    // const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    const type = url.searchParams.get('type');
    const genre = url.searchParams.get('genre');
    const subgenre = url.searchParams.get('subgenre');
    const level = url.searchParams.get('level');

    // 1. Use pagination
    let query = db.collection("new-articles")
      .orderBy("id")
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 2. Implement efficient querying
    if (type) query = query.where("type", "==", type);
    if (genre) query = query.where("genre", "==", genre);
    if (subgenre) query = query.where("subgenre", "==", subgenre);
    if (level) query = query.where("level", "==", level);

    const snapshot = await query.get();
    const articles = snapshot.docs.map(doc => doc.data());

    // 3. Use batch processing for user-specific data
    const batch = db.batch();
    const userArticleRefs = articles.map(article => 
      db.collection("users").doc(userId).collection("article-records").doc(article.id)
    );

    const userArticles = await db.getAll(...userArticleRefs);

    const results = articles.map((article, index) => {
      const userArticle = userArticles[index].data();
      return userArticle && userArticle.id === article.id
        ? { ...article, is_approved: true }
        : article;
    });

    // 4. Get total count for pagination
    const countSnapshot = await db.collection("new-articles").count().get();
    const totalCount = countSnapshot.data().count;

    return new Response(JSON.stringify({
      passages: results,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page
    }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({
      message: "Internal server error",
      error: error.message || error.toString(),
    }), { status: 500 });
  }
}


