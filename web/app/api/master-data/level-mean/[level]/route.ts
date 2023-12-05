//route
// api/master-data/level-mean

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";
import { ScoreRange } from "@/types/constants";

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

    const filePath = path.join(
      process.cwd(),
      "../data",
      "whats-my-level-mean.json"
    );

    const fileContents = fs.readFileSync(filePath, "utf8");
    const dataObject = JSON.parse(fileContents)?.CEFR_Level_Descriptions;
    const level = session.user.level;
    let CEFR_Level = "";

    for (const [key, range] of Object.entries(ScoreRange)) {
      const [min, max] = range.split("-").map(Number);
      if (level >= min && level <= max) {
        CEFR_Level = key;
      }
    }

    return new Response(
      JSON.stringify({
        message: "success",
        general_description: dataObject[CEFR_Level]?.General_Description,
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
