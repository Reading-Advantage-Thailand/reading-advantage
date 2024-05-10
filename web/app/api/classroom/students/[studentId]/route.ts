import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// update student name in report
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
    const name = json.name;
    const studentId = json.studentId;

    const userId = session.user.id;

      await db.collection("users").doc(studentId).update({
        name: name,
      });

    // update user session
    session.user.name = name;

    return new Response(
      JSON.stringify({
        message: "success",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("error", error);

    return new Response(
      JSON.stringify({
        message: error,
      }),
      { status: 500 }
    );
  }
}
