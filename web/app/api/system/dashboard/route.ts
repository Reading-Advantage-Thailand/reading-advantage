import db from "@/configs/firestore-config";
import { Timestamp } from "firebase-admin/firestore";
import { parse } from "path";

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

  const { searchParams } = new URL(req.url);
  // const startDate = searchParams.get("startDate");
  // const endDate = searchParams.get("endDate");
  const startDate = "2024-07-23";
  const endDate = "2024-07-23";

  // const start_date = startDate ? Timestamp.fromDate(new Date(startDate)) : null;
  // const end_date = endDate ? Timestamp.fromDate(new Date(endDate)) : null;
  // const start_date = startDate ? parseDate(startDate) : null;
  // const end_date = endDate ? parseDate(endDate, true) : null;

//   console.log('start_date', start_date);
// console.log('end_date', end_date);

  const articlesByLevel: { [key: string]: number } = {};

  for (const level of levels) {
    let query = db
      .collection("new-articles")
      .where("cefr_level", "==", level);
      
      if (startDate && endDate) {
        const snapshot = await query.get();
        snapshot.forEach((doc) => {
          const data = doc.data();
          const created_at = data.created_at;
          const formattedCreatedAt = created_at.slice(0, 10);
          if (formattedCreatedAt >= startDate && formattedCreatedAt <= endDate) {
            articlesByLevel[level] = (articlesByLevel[level] || 0) + 1;
          }
        }
        );
      }
    }

  return new Response(
    JSON.stringify({
      data: articlesByLevel,
      dataRange: {
        start_date: startDate,
        end_date: endDate,
      }
    }),
    { status: 200 }
  );
}

function parseDate(dateString: string, isEndDate: boolean = false): Date {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}