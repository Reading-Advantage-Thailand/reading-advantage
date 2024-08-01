import db from "@/configs/firestore-config";
import { Timestamp } from "firebase-admin/firestore";

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
  
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const start_date = startDate ? Timestamp.fromDate(new Date(startDate)) : null;
  const end_date = endDate ? Timestamp.fromDate(new Date(endDate)) : null;

  const { formattedStartDate, formattedEndDate } = getDateRange(start_date?.toDate()?.toISOString() ?? null, end_date?.toDate()?.toISOString() ?? null);

  const articlesByLevel: { [key: string]: number } = {};

  for (const level of levels) {
    let query = db
      .collection("new-articles")
      .where("cefr_level", "==", level);
      
      if (startDate && endDate) {
        query = query.where("created_at", ">=", formattedStartDate).where("created_at", "<=", formattedEndDate);
      }

      try {
        const countResult = await query.count().get(); 
        const count = countResult.data().count;
        articlesByLevel[level] = count; 
      } catch (error) {
        console.error(`Error fetching count for level ${level}`, error)
        articlesByLevel[level] = 0;
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

function parseDate(dateString: string, isStartDate: boolean = true): string {
  const date = new Date(dateString);
  
  if (isStartDate) {
    // Set to the day before at 23:59:59.999
    date.setDate(date.getDate() - 1);
    date.setHours(23, 59, 59, 999);
  } else {
    // Set to the end of the given day (23:59:59.999)
    date.setHours(23, 59, 59, 999);
  }
  
  return date.toISOString();
}

function getDateRange(start_date: string | null, end_date: string | null): { formattedStartDate: string, formattedEndDate: string } {
  const formattedStartDate = start_date ? parseDate(start_date, true) : '';
  const formattedEndDate = end_date ? parseDate(end_date, false) : '';
  return {
    formattedStartDate,
    formattedEndDate,
  };
}