export async function checkArticleCompletion(
  userId: string,
  articleId: string
): Promise<{
  mcqCompleted: boolean;
  saqCompleted: boolean;
  laqCompleted: boolean;
  allCompleted: boolean;
}> {
  try {
    const mcqResponse = await fetch(
      `/api/v1/articles/${articleId}/questions/mcq`
    );
    const mcqData = await mcqResponse.json();
    const mcqCompleted = mcqData.state === 2;

    const saqResponse = await fetch(
      `/api/v1/articles/${articleId}/questions/sa`
    );
    const saqData = await saqResponse.json();
    const saqCompleted = saqData.state === 2;

    const laqResponse = await fetch(
      `/api/v1/articles/${articleId}/questions/laq`
    );
    const laqData = await laqResponse.json();
    const laqCompleted = laqData.state === 2;

    const allCompleted = mcqCompleted && saqCompleted && laqCompleted;

    if (allCompleted) {
      console.log(
        `🎉 All questions completed for article ${articleId}! ARTICLE_READ will be updated on server side.`
      );
    }

    return {
      mcqCompleted,
      saqCompleted,
      laqCompleted,
      allCompleted,
    };
  } catch (error) {
    console.error("Error checking article completion:", error);
    return {
      mcqCompleted: false,
      saqCompleted: false,
      laqCompleted: false,
      allCompleted: false,
    };
  }
}
