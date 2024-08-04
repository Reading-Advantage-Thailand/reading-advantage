import OpenAI from "openai";
import db from "@/configs/firestore-config";
import {generateAudioWord} from "@/server/utils/generators/audio-words-generator";

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
      const resultWordList = JSON.parse(
        response.choices[0].message.function_call?.arguments as string
      )?.word_list;
      console.log("resultWordList", resultWordList);
      await articleRef.set({
        word_list: resultWordList,
        articleId: param.articleId,
      });

      // gen file audio
      /*
      [
    {
        "vocabulary": "gathered",
        "definition": {
            "en": "to bring together or collect",
            "th": "รวบรวม",
            "cn": "收集",
            "tw": "收集",
            "vi": "thu thập"
        }
    },
    {
        "vocabulary": "ingredients",
        "definition": {
            "en": "the parts or substances used to make a dish",
            "th": "ส่วนผสม",
            "cn": "成分",
            "tw": "成分",
            "vi": "nguyên liệu"
        }
    },
    {
        "vocabulary": "frosting",
        "definition": {
            "en": "a sweet topping made from sugar, butter, and flavoring for cakes",
            "th": "น้ำตาลเคลือบ",
            "cn": "糖霜",
            "tw": "糖霜",
            "vi": "kem phủ"
        }
    },
    {
        "vocabulary": "golden brown",
        "definition": {
            "en": "a color describing food that is cooked until it has a light brown color",
            "th": "สีน้ำตาลทอง",
            "cn": "金褐色",
            "tw": "金棕色",
            "vi": "màu nâu vàng"
        }
    },
    {
        "vocabulary": "spaghetti",
        "definition": {
            "en": "a type of long, thin pasta",
            "th": "สปาเกตตี",
            "cn": "意大利面",
            "tw": "義大利麵",
            "vi": "mì ống"
        }
    },
    {
        "vocabulary": "mashed potatoes",
        "definition": {
            "en": "cooked potatoes that are crushed and mixed until smooth",
            "th": "มันฝรั่งบด",
            "cn": "土豆泥",
            "tw": "土豆泥",
            "vi": "khoai tây nghiền"
        }
    },
    {
        "vocabulary": "surprise",
        "definition": {
            "en": "to cause someone to feel astonished or shocked",
            "th": "ทำให้ประหลาดใจ",
            "cn": "惊讶",
            "tw": "驚訝",
            "vi": "ngạc nhiên"
        }
    },
    {
        "vocabulary": "excited",
        "definition": {
            "en": "having a strong feeling of enthusiasm and eagerness",
            "th": "ตื่นเต้น",
            "cn": "兴奋",
            "tw": "興奮",
            "vi": "hào hứng"
        }
    },
    {
        "vocabulary": "grateful",
        "definition": {
            "en": "feeling or showing thanks",
            "th": "รู้สึกขอบคุณ",
            "cn": "感激的",
            "tw": "感激的",
            "vi": "biết ơn"
        }
    },
    {
        "vocabulary": "joy",
        "definition": {
            "en": "a feeling of great happiness",
            "th": "ความสุข",
            "cn": "快乐",
            "tw": "快樂",
            "vi": "niềm vui"
        }
    }
]
      */
      try {
        await generateAudioWord({
          passage: ["gathered", "joy"],
          articleId: param?.articleId,
        });
      } catch (error) {
        console.log(error);
        throw new Error(`failed to generate audio: ${error}`);
      }

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
