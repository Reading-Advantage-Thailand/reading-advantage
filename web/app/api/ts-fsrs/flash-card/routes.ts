import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request, res: Response) {
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
    const json = await req.json();
    const body = JSON.parse(json.body);
    const id = body.id;

    await db
      .collection("user-sentence-records")
      .doc(id)
      .update({
        ...body,
      });

    return new Response(
      JSON.stringify({
        message: "success",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}