//route
// api/master-data/level-mean

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from 'next';
import fs from "fs";
import path from "path";
import {ScoreRange} from "@/types/constants";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
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
    const dataObject = JSON.parse(fileContents);
    console.log("dataObject : ", dataObject);
    const level = session.user.level;


    return new Response(
      JSON.stringify({
        message: "success",
        general_description: level,
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
};