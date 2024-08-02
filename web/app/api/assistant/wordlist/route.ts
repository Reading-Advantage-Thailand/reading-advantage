import OpenAI from "openai";
import db from "@/configs/firestore-config";

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();

    // First need to find the word list of the article in db
    const articleRef = db.collection(`word-list`).doc(param?.articleId);
    const articleSnapshot = await articleRef.get();
    const article = articleSnapshot.data();

    if (articleSnapshot?.exists) {
      return new Response(
        JSON.stringify({
          messages: "success",
          word_list: article?.word_list,
        }),
        { status: 200 }
      );
    } else {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt_user = `Extract the ten most difficult vocabulary words, phrases, or idioms from the following passage: ${param.article.passage}`;

      const schema = {
        type: "object",
        properties: {
          word_list: {
            type: "array",
            items: {
              type: "object",
              properties: {
                vocabulary: {
                  type: "string",
                  description: "A difficult vocabulary word, phrase, or idiom.",
                },
                definition: {
                  type: "object",
                  properties: {
                    en: {
                      type: "string",
                      description:
                        "The English definition of the vocabulary in simple language.",
                    },
                    th: {
                      type: "string",
                      description: "The Thai translation of the vocabulary.",
                    },
                    cn: {
                      type: "string",
                      description:
                        "The Simplified Chinese translation of the vocabulary.",
                    },
                    tw: {
                      type: "string",
                      description:
                        "The Traditional Chinese translation of the vocabulary.",
                    },
                    vi: {
                      type: "string",
                      description:
                        "The Vietnamese translation of the vocabulary.",
                    },
                  },
                },
              },
            },
          },
        },
        required: ["word_list"],
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an article database assisstant.",
          },
          { role: "user", content: `${prompt_user}` },
        ],
        functions: [
          {
            name: "extract_difficult_vocabulary",
            description:
              "Extracts the ten most difficult vocabulary words, phrases, or idioms from a given passage and provides their definitions or translations in multiple languages.",
            parameters: schema,
          },
        ],
        function_call: {
          name: "extract_difficult_vocabulary",
        },
        temperature: 0.7,
      });

      // Save to db
      await articleRef.set({
        word_list: JSON.parse(
          response.choices[0].message.function_call?.arguments as string
        )?.word_list,
        articleId: param.articleId,
      });

      // gen file audio
      /*
      try {
       
        const allTimepoints: any[] = [];
        let index = 0;
--> chunks : array ของ word

--> check check จาก validateAudioWords ว่ามีไฟล์ mp3 ไหม 
        
            const timepoints = await fetchAudio(chunks[i], i, params.articleId);
            timepoints.forEach((tp: any) => {
                allTimepoints.push({
                    markName: `sentence${index}`,
                    timeSeconds: tp.timeSeconds,
                    index: index,
                    file: `${params.articleId}_${i}.mp3`,
                });
                index++;
            });
        

        // Update the database with all timepoints
        await db.collection("new-articles").doc(params.articleId).update({
            timepoints: allTimepoints,
            id: params.articleId,
        });
    } catch (error) {
        console.log(error);
        throw new Error(`failed to generate audio: ${error}`);
    }
      */

      return new Response(
        JSON.stringify({
          messages: "success",
          word_list: JSON.parse(
            response.choices[0].message.function_call?.arguments as string
          )?.word_list,
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
