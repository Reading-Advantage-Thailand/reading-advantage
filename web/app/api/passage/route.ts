import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/configs/firestore-config";
import firebase from "firebase-admin";
import { startAt, endAt } from "@firebase/firestore";
import { z } from "zod";

// Define the schema for input validation
const QueryParamsSchema = z.object({
  userId: z.string().max(50),
  pageSize: z.number().int().positive().max(10),
  typeParam: z.string().min(0).max(50).nullable(),
  genreParam: z.string().min(0).max(50).nullable(),
  subgenreParam: z.string().min(0).max(50).nullable(),
  levelParam: z.number().int().min(0).max(50).nullable(),
  lastDocId: z.string().nullable(),
  searchTermParam: z.string().min(0).max(100).nullable(),
});

type QueryParams = z.infer<typeof QueryParamsSchema>;

function validateQueryParams(params: QueryParams): QueryParams {
  try {
    return QueryParamsSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Invalid input parameters: ${errorMessages}`);
    }
    throw error;
  }
}

async function fetchArticles(params: {
  userId: string;
  pageSize: number;
  typeParam: string;
  genreParam: string;
  subgenreParam: string;
  levelParam: number;
  lastDocId: string | null;
  searchTermParam: string;
}) {
  const validatedParams = validateQueryParams(params);

  const {
    userId,
    pageSize,
    typeParam,
    genreParam,
    subgenreParam,
    levelParam,
    lastDocId,
    searchTermParam,
  } = validatedParams;

  // console.log("==============FetchArticles()================");
  // console.log("lastDocId in fetchArticles:", lastDocId);
  // console.log("typeParam in fetchArticles:", typeParam);
  // console.log("genreParam in fetchArticles:", genreParam);
  // console.log("subgenreParam in fetchArticles:", subgenreParam);
  // console.log("levelParam in fetchArticles:", levelParam);
  // console.log("searchTermParam in fetchArticles:", searchTermParam);

  let query = db.collection("new-articles");

  if (typeParam)
    query = query.where(
      "type",
      "==",
      typeParam
    ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  if (genreParam)
    query = query.where(
      "genre",
      "==",
      genreParam
    ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  if (subgenreParam)
    query = query.where(
      "subgenre",
      "==",
      subgenreParam
    ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  if (levelParam)
    query = query.where(
      "ra_level",
      "==",
      levelParam
    ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

  if (searchTermParam) {
    const searchTermLower = searchTermParam.toLowerCase();

    // Split the search term into words
    const searchWords = searchTermLower.split(/\s+/);
    // console.log("searchWords in fetchArticles:", searchWords);

    if (searchWords.length > 0) {
      //Partial text search for the entire search term to match the title
      (query = query.orderBy(
        "title"
      ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>),
        startAt(searchTermParam),
        endAt(searchTermParam + "\uf8ff");
    }
  }

  // query = query.orderBy(
  //   "created_at",
  //   "desc"
  // ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

  // Assume processedDocIds is a Set that keeps track of all processed lastDocIds
  if (lastDocId) {
    const lastDocRef = db.collection("new-articles").doc(lastDocId);
    const lastDocSnapshot = await lastDocRef.get();
    if (lastDocSnapshot.exists) {
      query = query.startAfter(
        lastDocSnapshot
      ) as firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
    }
  }

  const snapshot = await query.limit(pageSize + 1).get();

  let articles = snapshot.docs.slice(0, pageSize).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const hasMore = snapshot.docs.length > pageSize;
  const lastDocument = snapshot.docs[pageSize - 1];

  const userArticleRefs = articles.map((article) =>
    db
      .collection("users")
      .doc(userId)
      .collection("article-records")
      .doc(article.id)
  );

  const userArticles = await Promise.all(
    userArticleRefs.map((ref) => ref.get())
  );

  const results = articles.map((article, index) => {
    const userArticle = userArticles[index].data();
    return userArticle && userArticle.id === article.id
      ? { ...article, is_approved: true }
      : article;
  });

  return {
    passages: results,
    hasMore,
    lastDocId: lastDocument ? lastDocument.id : null,
  };
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
      });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const pageSize = 10;
    const typeParam = url.searchParams.get("type") || "";
    const genreParam = url.searchParams.get("genre") || "";
    const subgenreParam = url.searchParams.get("subgenre") || "";
    const levelParam = Number(url.searchParams.get("level"));
    const lastDocId = url.searchParams.get("lastDocId");
    const searchTermParam = url.searchParams.get("searchTerm") || "";

    const params = {
      userId,
      pageSize,
      typeParam,
      genreParam,
      subgenreParam,
      levelParam,
      lastDocId,
      searchTermParam,
    };
    // console.log("==============GET()================");
    // console.log("lastDocId in GET:", lastDocId);
    // console.log("typeParam in GET:", typeParam);
    // console.log("genreParam in GET:", genreParam);
    // console.log("subgenreParam in GET:", subgenreParam);
    // console.log("levelParam in GET:", levelParam);
    // console.log("searchTermParam in GET:", searchTermParam);

    const data = await fetchArticles(params);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    console.error("Detailed error:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message || error.toString(),
      }),
      { status: 500 }
    );
  }
}
