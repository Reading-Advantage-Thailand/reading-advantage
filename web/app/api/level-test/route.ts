//route
// api/level-test

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
      "/assets/json",
      "level-test.json"
    );

    const fileContents = fs.readFileSync(filePath, "utf8");
    const dataObject = JSON.parse(fileContents)?.language_placement_test;
console.log('dataObject: ', dataObject);

    return new Response(
      JSON.stringify({
        message: "success",
        language_placement_test: dataObject,
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
