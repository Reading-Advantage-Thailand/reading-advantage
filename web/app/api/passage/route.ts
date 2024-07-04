import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
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
    let results: any[] = [];

    const userId = session.user.id;
    const articlesRef = db.collection("new-articles");
    const snapshot = await articlesRef.get();
    const articles = snapshot.docs.map((doc) => doc.data());

    for (const article of articles) {
      if (
        typeof article.id === "string" &&
        article.id.trim() !== "" &&
        article.id !== undefined
      ) {
        const articleRecord = await db
          .collection("users")
          .doc(userId)
          .collection("article-records")
          .doc(article.id)
          .get();

        // If the article record exists and is the same as the article, add is_approved field to the article
        if (
          articleRecord.data() !== undefined &&
          articleRecord.data()?.id === article.id &&
          !results.includes(articleRecord.data())
        ) {
          results.push({ ...article, is_approved: true });
        } else {
          results.push(article);
        }
      }
    }

    return new Response(
      JSON.stringify({
        passages: results,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message || error.toString(),
      }),
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//     try {
//       const { searchParams } = new URL(req.url);
//       const level = parseInt(searchParams.get("level") || "1");
//       const type = searchParams.get("type");
//       const genre = searchParams.get("genre");
//       const subgenre = searchParams.get("subgenre");
//       const page = parseInt(searchParams.get("page") || "1");
//       const pageSize = parseInt(searchParams.get("pageSize") || "10");
//       const sortBy = searchParams.get("sortBy") || "raLevel";
//       const sortOrder = searchParams.get("sortOrder") || "asc";

//       // Function to replace all dashes with spaces
//       const replaceSpaces = (str: string) => str.replace(/-/g, " ");

//       // Base query
//       let articlesQuery = db.collection("new-articles")
//         .where("raLevel", ">=", level - 1)
//         .where("raLevel", "<=", level + 1);

//       // Apply filters
//       if (type) articlesQuery = articlesQuery.where('type', '==', type);
//       if (genre) articlesQuery = articlesQuery.where('genre', '==', replaceSpaces(genre));
//       if (subgenre) articlesQuery = articlesQuery.where('subGenre', '==', replaceSpaces(subgenre));

//       // Apply sorting
//       articlesQuery = articlesQuery.orderBy(sortBy, sortOrder as 'asc' | 'desc');

//       // Get total count
//       const totalCount = (await articlesQuery.count().get()).data().count;

//       // Apply pagination
//       articlesQuery = articlesQuery.offset((page - 1) * pageSize).limit(pageSize);

//       const articlesSnapshot = await articlesQuery.get();

//       // If user is authenticated, get read status
//       const session = await getServerSession(authOptions);
//       const userId = session?.user?.id;

//       const articles = await Promise.all(articlesSnapshot.docs.map(async (doc) => {
//         const articleData = doc.data();
//         let isRead = false;
//         let status = null;

//         if (userId) {
//           const articleRecord = await db
//             .collection("user-article-records")
//             .doc(`${userId}-${doc.id}`)
//             .get();
//           const userArticleRecord = articleRecord.data();
//           isRead = !!userArticleRecord;
//           status = userArticleRecord?.status;
//         }

//         return {
//           articleId: doc.id,
//           type: articleData.type,
//           subgenre: articleData.subGenre,
//           genre: articleData.genre,
//           raLevel: articleData.raLevel,
//           title: articleData.title,
//           cefrLevel: articleData.cefrLevel,
//           summary: 'wait for summary',
//           isRead,
//           status,
//           averageRating: articleData.averageRating,
//           totalRatings: articleData.totalRatings,
//           topic: articleData.topic,
//           readCount: articleData.readCount
//         };
//       }));

//       return NextResponse.json({
//         data: articles,
//         pagination: {
//           page,
//           pageSize,
//           totalCount,
//           totalPages: Math.ceil(totalCount / pageSize)
//         }
//       });

//     } catch (error) {
//       console.error('Error in /api/articles:', error);
//       return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//     }
//   }
