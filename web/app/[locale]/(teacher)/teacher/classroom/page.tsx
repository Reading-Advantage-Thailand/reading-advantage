import ClassroomDashboard from "@/components/teacher/classroom-dashboard";
import { cookies } from "next/headers";
import { google, classroom_v1 } from "googleapis";
import React from "react";
import oauth2Client, { SCOPE } from "@/utils/classroom/teacher";
import { Header } from "@/components/header";
import { getScopedI18n } from "@/locales/server";

type Schema$Course = classroom_v1.Schema$Course;

interface CoursesResponse {
  courses: Schema$Course[]; // Make courses optional to handle undefined
}

export default async function Classroom() {
  const t = await getScopedI18n("components.myClasses.Classroom");
  const cookieStore = cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;
  oauth2Client.setCredentials({ access_token: accessToken });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPE,
    include_granted_scopes: true,
  });

  let courses: CoursesResponse = { courses: [] };

  try {
    const classroom = google.classroom({ version: "v1", auth: oauth2Client });
    const response = await classroom.courses.list({ teacherId: "me" });
    // Ensure 'id' is always a string (fallback to empty string if undefined or null)
    courses = { courses: response.data.courses || [] };
  } catch (error) {
    console.log(error);
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Header heading={t("header")} />
        <ClassroomDashboard
          courses={courses.courses || []}
          authUrl={authUrl}
          accessToken={Boolean(accessToken)}
        />
      </div>
    </div>
  );
}
