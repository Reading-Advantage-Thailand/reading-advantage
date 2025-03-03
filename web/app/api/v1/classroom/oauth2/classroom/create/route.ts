import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { google } from "googleapis";
import oauth2Client from "@/utils/classroom";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken)
    return NextResponse.json({ error: "Unauthorized" }, { status: 500 });

  const { name, room, section, description } = await req.json();
  try {
    const classroom = google.classroom({
      version: "v1",
      auth: oauth2Client,
    });

    const newCourse = await classroom.courses.create({
      requestBody: {
        name: name,
        section: section || "",
        description: description || "",
        room: room || "",
        ownerId: "me",
      },
    });

    return NextResponse.json(
      { message: "Create courses success" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create course", details: error },
      { status: 500 }
    );
  }
}
