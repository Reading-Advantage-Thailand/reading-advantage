// user/[userId]
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import * as z from "zod";

const userLevelSchema = z.object({
  level: z.number(),
});
// get user info
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

    const userId = session.user.id;

    const user = await db.collection("users").doc(userId).get();

    if (!user.exists) {
      return new Response(
        JSON.stringify({
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "success",
        data: user.data(),
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

// update user level
// export async function PATCH(req: Request, res: Response) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             return new Response(JSON.stringify({
//                 message: 'Unauthorized',
//             }), { status: 403 })
//         }

//         const json = await req.json();
//         const body = JSON.parse(json.body);
//         const level = body.level;
//         const userId = session.user.id;

//         await db.collection('users')
//             .doc(userId)
//             .update({
//                 level: level,
//             });

//         // update user session
//         session.user.level = level;

//         return new Response(JSON.stringify({
//             message: 'success',
//         }), { status: 200 })
//     } catch (error) {
//         return new Response(JSON.stringify({
//             message: error,
//         }), { status: 500 })
//     }
// }

//update user email verified
export async function PUT(req: Request, res: Response) {
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

    const userId = session.user.id;

    await db.collection("users").doc(userId).update({
      verified: true,
    });

    // update user session
    session.user.verified = true;

    return new Response(
      JSON.stringify({
        message: "success",
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

// update user xp and level
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
    const xp = JSON.parse(json.xp);
    const level = JSON.parse(json.level);

    const userId = session.user.id;

    await db.collection("users").doc(userId).update({
      xp: xp,
      level: level,
    });

    // update user session
    session.user.xp = xp;
    session.user.level = level;

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
