import React from "react";
import MyClasses from "@/components/teacher/my-classes";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import { ClassesData } from "@/lib/classroom-utils";

export default async function MyClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const res = await ClassesData();
  const classes = res.classes;

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <MyClasses
          userId={user.id}
          userName={user.display_name}
          classrooms={classes}
        />
      </NextAuthSessionProvider>
    </div>
  );
}
