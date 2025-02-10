const admin = require("firebase-admin");
const fs = require("fs");
const base64 = require("base64-js");
const axios = require("axios");
const dotenv = require("dotenv");
const uploadToBucket = require("./utils/uploadToBucket");

dotenv.config({ path: "./config.env" });

const serviceAccountKey = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const db = admin.firestore();

const AVAILABLE_VOICES = [
  "en-US-Neural2-A",
  "en-US-Neural2-C",
  "en-US-Neural2-D",
  "en-US-Neural2-E",
  "en-US-Neural2-F",
  "en-US-Neural2-G",
  "en-US-Neural2-H",
  "en-US-Neural2-I",
  "en-US-Neural2-J",
];

function contentToSSML(content) {
  let ssml = "<speak>";
  content.forEach((sentence, i) => {
    ssml += `<s><mark name='word${
      i + 1
    }'/>${sentence}<break time="500ms"/></s>`;
  });
  ssml += "</speak>";
  return ssml;
}

function logError(message) {
  const logFilePath = "./logs/generatewordAudio-log.txt"; // Log file location
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] - ${message}\n`;

  // Write error to file (append mode)
  fs.appendFileSync(logFilePath, logMessage, "utf8");
}

const updateWordAudio = async (year, month) => {
  if (month < 1 || month > 12) {
    console.error("Invalid month. Month must be between 1 and 12.");
    return;
  }

  // Calculate the start and end date of the custom month
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1)); // Month is zero-indexed (Jan = 0)
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59)); // Last day of the month, 23:59:59

  try {
    function chunkArray(arr, size) {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    }

    const collectionRef = await db
      .collection("new-articles")
      .where("created_at", ">=", startOfMonth.toISOString())
      .where("created_at", "<=", endOfMonth.toISOString())
      .orderBy("created_at", "asc")
      .get();

    const data = collectionRef.docs.map((data) => data.id);

    const chunkedData = chunkArray(data, 30);

    let allWordlistData = [];

    for (const chunk of chunkedData) {
      const wordlistRef = await db
        .collection("word-list")
        .where("articleId", "in", chunk)
        .get();

      // Map the results and push them into the `allWordlistData` array
      const wordlistDocs = wordlistRef.docs.map((data) => {
        const getData = data.data();
        return {
          articleId: getData.articleId || getData.id,
          vocabulary:
            getData.word_list && Array.isArray(getData.word_list)
              ? getData.word_list.map((word) => word.vocabulary) // Extract vocabulary if word_list exists and is an array
              : [],
        };
      });
      allWordlistData = allWordlistData.concat(wordlistDocs);
    }

    //console.log("number article for generate: ", allWordlistData.length);

    const generateWordAudio = async (vocab, articleId) => {
      const voice =
        AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
      const baseUrl = "https://texttospeech.googleapis.com";
      try {
        const response = await axios.post(
          `${baseUrl}/v1beta1/text:synthesize?key=${process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY}`,
          {
            input: {
              ssml: contentToSSML(vocab),
            },
            voice: {
              languageCode: "en-US",
              name: voice,
            },
            audioConfig: {
              audioEncoding: "MP3",
            },
            enableTimePointing: ["SSML_MARK"],
          }
        );

        const MP3 = base64.toByteArray(response.data.audioContent);

        const localPath = `${process.cwd()}/tmp/${articleId}.mp3`;
        fs.writeFileSync(localPath, MP3);

        await uploadToBucket(localPath, `audios-words/${articleId}.mp3`);

        await db.collection("word-list").doc(articleId).update({
          timepoints: response.data.timepoints,
          created_at: new Date().toISOString(),
          id: articleId,
        });
      } catch (error) {
        // Log error but continue with the next iteration
        logError(
          `Error generating audio for article ${articleId}: ${error.message}`
        );
      }
    };

    for (let i = 0; i < allWordlistData.length; i++) {
      const wordData = allWordlistData[i];

      try {
        await generateWordAudio(wordData.vocabulary, wordData.articleId);
        console.log(`Generate Success: ${i + 1}/${allWordlistData.length}`);
      } catch (error) {
        logError(
          `Error processing wordlist for article ${wordData.articleId}: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.log(error);
    logError(`General error during updateWordAudio: ${error.message}`);
  }
};
//prameters year, month
updateWordAudio(2023, 7);
