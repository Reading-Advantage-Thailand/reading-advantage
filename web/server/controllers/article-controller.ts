import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { Article } from "@/components/models/article-model";
import { QuizStatus } from "@/components/models/questions-model";
import { ExtendedNextRequest } from "./auth-controller";


// GET search articles
// GET /api/v1/articles?level=10&type=fiction&genre=Fantasy
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

    let data = await db
      .collection("new-articles")
      .where("ra_level", ">=", Number(level) - 1)
      .where("ra_level", "<=", Number(level) + 1)
      .orderBy("created_at", "desc")
      .limit(10);

    let typeResult = await db.collection("article-selection").doc(level);

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

// GET article by id
// GET /api/v1/articles/[id]
interface RequestContext {
  params: {
    article_id: string;
  };
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

    return NextResponse.json({
      article,
    });
  } catch (err) {
    console.log("Error getting documents", err);
    return NextResponse.json(
      { message: "[getArticle] Internal server error", error: err },
      { status: 500 }
    );
  }
}
