import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { Article } from "@/components/models/article-model";
import { QuizStatus } from "@/components/models/questions-model";
import { ExtendedNextRequest } from "./auth-controller";
import { startAt, endAt } from "@firebase/firestore";
import { z } from "zod";
import firebase from "firebase-admin";

// GET article by id
// GET /api/articles/[id]
interface RequestContext {
  params: {
    article_id: string;
  };
}

// GET search articles
// GET /api/articles?level=10&type=fiction&genre=Fantasy
export async function getSearchArticles(req: ExtendedNextRequest) {
  try {
    const userId = req.session?.user.id as string;
    const level = req.session?.user.level?.toString();
    const type = req.nextUrl.searchParams.get("type");
    const genre = req.nextUrl.searchParams.get("genre");
    const subgenre = req.nextUrl.searchParams.get("subgenre");
    let selectionType: any[] = [];
    let results: any[] = [];

    if (!level) {
      return NextResponse.json(
        { message: "Level is required" },
        { status: 400 }
      );
    }

    let data = db
      .collection("new-articles")
      .where("ra_level", ">=", Number(level) - 1)
      .where("ra_level", "<=", Number(level) + 1)
      .orderBy("created_at", "desc")
      .limit(10);

    let typeResult = db.collection("article-selection").doc(level);

    if (type) {
      typeResult = typeResult.collection("types").doc(type);
    }
    if (genre) {
      typeResult = typeResult.collection("genres").doc(genre);
    }

    const fetchArticles = async (query: any) => {
      const snapshot = await query.get();

      //random article
      // const getDoc = snapshot.docs.sort(() => 0.5 - Math.random()).slice(0, 10);

      const results = [];

      for (const doc of snapshot.docs) {
        const articleRecord = await db
          .collection("users")
          .doc(userId)
          .collection("article-records")
          .doc(doc.id)
          .get();
        if (articleRecord.exists) {
          results.push({ ...doc.data(), is_read: true });
        } else {
          results.push(doc.data());
        }
      }

      return results;
    };

    const getArticles = async ({ subgenre, genre, type, level }: any) => {
      let query = data;

      if (subgenre) {
        query = query.where("subgenre", "==", subgenre.replace(/_/g, " "));
      }
      if (genre) {
        query = query.where("genre", "==", genre.replace(/_/g, " "));
      }
      if (type) {
        query = query.where("type", "==", type.replace(/_/g, " "));
      }

      return await fetchArticles(query);
    };

    results = await getArticles({ subgenre, genre, type, level });

    const snapType = await typeResult.get();
    selectionType = Object.entries(snapType.data() as any).map(
      ([key, value]) => key
    );

    return NextResponse.json({
      params: {
        level,
        type,
        genre,
        subgenre,
      },
      results,
      selectionType,
    });
  } catch (err) {
    console.log("Error getting documents", err);
    return NextResponse.json(
      {
        message: "[getSearchArticles] Internal server error",
        results: [],
        error: err,
      },
      { status: 500 }
    );
  }
}

export async function getArticle(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    const resp = await db.collection("new-articles").doc(article_id).get();

    // Check if user has read the article
    if (!resp.exists) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 }
      );
    }

    // Check if user has read the article
    const record = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .get();

    if (!record.exists) {
      await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .collection("article-records")
        .doc(article_id)
        .set({
          id: article_id,
          rated: 0,
          scores: 0,
          title: resp.data()?.title,
          status: QuizStatus.READ,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          level: req.session?.user.level,
        });
    }

    const article = resp.data() as Article;

    if (
      !article ||
      !article.summary ||
      !article.image_description ||
      !article.passage ||
      !article.created_at ||
      (article.average_rating !== 0 && !article.average_rating) ||
      !article.timepoints ||
      !article.type ||
      !article.title ||
      !article.cefr_level ||
      !article.ra_level ||
      !article.subgenre ||
      !article.genre ||
      !article.id ||
      (article.read_count !== 0 && !article.read_count)
    ) {
      return NextResponse.json(
        {
          message: "Article fields are not correct",
          invalids: {
            summary: !article.summary,
            image_description: !article.image_description,
            passage: !article.passage,
            created_at: !article.created_at,
            average_rating:
              !article.average_rating && article.average_rating !== 0,
            timepoints: !article.timepoints,
            type: !article.type,
            title: !article.title,
            cefr_level: !article.cefr_level,
            ra_level: !article.ra_level,
            subgenre: !article.subgenre,
            genre: !article.genre,
            id: !article.id,
            read_count: article.read_count !== 0 && !article.read_count,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        article,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error getting documents", err);
    return NextResponse.json(
      { message: "[getArticle] Internal server error", error: err },
      { status: 500 }
    );
  }
}

export async function deleteArticle(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    const articlesRef = db.collection("new-articles");
    //    const articlesRef = db.collection('test-collection');
    const articleToDelete = await articlesRef.doc(article_id).get();

    const mcSubcollection = await articleToDelete.ref
      .collection("mc-questions")
      .get();
    mcSubcollection.docs.forEach((doc) => {
      doc.ref
        .delete()
        .then(() => console.log(`Deleted doc: ${doc.id} from mc-questions`));
    });

    const saSubcollection = await articleToDelete.ref
      .collection("sa-questions")
      .get();
    saSubcollection.docs.forEach((doc) => {
      doc.ref
        .delete()
        .then(() => console.log(`Deleted doc: ${doc.id} from sa-questions`));
    });

    const laSubcollection = await articleToDelete.ref
      .collection("la-questions")
      .get();
    laSubcollection.docs.forEach((doc) => {
      doc.ref
        .delete()
        .then(() => console.log(`Deleted doc: ${doc.id} from la-questions`));
    });

    // if (userId && userRole.includes("SYSTEM")) {
    //   if (!articleToDelete.exists) {
    //     return new Response(
    //       JSON.stringify({ message: "No such article found" }),
    //       { status: 404 }
    //     );
    //   } else {
    //     await articlesRef.doc(articleId).delete();
    //     console.log("Document successfully deleted");
    //     return new Response(JSON.stringify({ message: "Article deleted" }), {
    //       status: 200,
    //     });
    //   }
    // }

    // if (!userRole.includes("SYSTEM")) {
    //   return new Response(
    //     JSON.stringify({
    //       message: "Unauthorized",
    //     }),
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json(
      {
        message: "Article Deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getArticleWithParams(req: ExtendedNextRequest) {
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

  try {
    const userId = req.session?.user.id as string;
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const pageSize = 10;
    const typeParam = searchParams.get("type") || "";
    const genreParam = searchParams.get("genre") || "";
    const subgenreParam = searchParams.get("subgenre") || "";
    const levelParam = Number(searchParams.get("level"));
    const lastDocId = searchParams.get("lastDocId");
    const searchTermParam = searchParams.get("searchTerm") || "";

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

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
}
