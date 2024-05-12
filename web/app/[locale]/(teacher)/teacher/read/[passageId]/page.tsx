import ArticleCard from "@/components/article-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { getScopedI18n } from "@/locales/server";
// import TeacherReadArticleCard  from "@/components/teacher/teacherReadArticleCard";
import { fetchData } from "@/utils/fetch-data";
import CustomError from "../../../../(student)/student/read/[articleId]/custom-error"; 
import MCQuestionCard from "@/components/questions/mc-question-card";
import SAQuestionCard from "@/components/questions/sa-question-card"; 
import AssignDialog from "@/components/teacher/assign-dialog";

export const metadata = {
  title: "Teahcer Read Assignment Page",
  description: "Teahcer Read Assignment Page",
};

// async function getArticle(passageId: string) {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${passageId}`,
//     {
//       method: "GET",
//       headers: headers(),
//     }
//   );
//   const data = await response.json();
//   return data;
// }

async function getArticle(articleId: string) {
    return fetchData(`/api/v1/articles/${articleId}`);
  }

export default async function TeacherReadAssignmentPage({
  params,
}: {
  params: { passageId: string };
}) {
  const t = await getScopedI18n("pages.student.readPage.article");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

const articleResponse = await getArticle(params.passageId);
  if (articleResponse.message)
    return <CustomError message={articleResponse.message} />;

  return (
    <>
     <div className="md:flex md:flex-row md:gap-3 md:mb-5">
      {/* <TeacherReadArticleCard
        article={articleResponse.article}
        articleId={params.passageId}
        userId={user.id}
      /> */}
        <ArticleCard
        article={articleResponse.article}
        articleId={params.passageId}
        userId={user.id}
      />
        <div className="flex flex-col mb-40 md:mb-0 md:basis-2/5 mt-4">
        <AssignDialog 
          article={articleResponse.article}
          articleId={params.passageId}
          userId={user.id}
        />
        <MCQuestionCard userId={user.id} articleId={params.passageId} />
        <SAQuestionCard userId={user.id} articleId={params.passageId} />
        <div>
      </div>
      </div>
      </div>
    </>
  );
}
