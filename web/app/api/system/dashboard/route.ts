import db from "@/configs/firestore-config";

export async function GET(req: Request) {
  const levels = [
    "A0-",
    "A0",
    "A0+",
    "A1",
    "A1+",
    "A2-",
    "A2",
    "A2+",
    "B1-",
    "B1",
    "B1+",
    "B2-",
    "B2",
    "B2+",
    "C1-",
    "C1",
    "C1+",
    "C2-",
    "C2",
  ];
  const articlesByLevel: { [key: string]: number } = {};

  for (const level of levels) {
    const query = db
      .collection("new-articles")
      .where("cefr_level", "==", level);
    const countResult = await query.count().get(); 

    const count = countResult.data().count;
    articlesByLevel[level] = count; 
  }

  return new Response(
    JSON.stringify({
      data: articlesByLevel,
    }),
    { status: 200 }
  );
}
