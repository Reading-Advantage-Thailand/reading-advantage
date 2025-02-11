const admin = require("firebase-admin");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const serviceAccountKey = require("./service_account_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const db = admin.firestore();
const collectionRef = db.collection("new-articles");

const fictionGenres = JSON.parse(
  fs.readFileSync("./data/genres-fiction.json", "utf8")
);
const nonFictionGenres = JSON.parse(
  fs.readFileSync("./data/genres-nonfiction.json", "utf8")
);

const genreWhitelist = {
  fiction: fictionGenres.Genres,
  nonfiction: nonFictionGenres.Genres,
};

async function classifyGenre(articleText, type) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI trained to categorize articles based on a given genre list.",
          },
          {
            role: "user",
            content: `Look at the given passage and choose the most appropriate genre and associated subgenre from the given list.
         You must return only whitelisted genres and subgenres in a JSON format like this:
         {
           "name": "Selected Genre",
           "subgenres": ["Selected Subgenre"]
         }
         
         Passage: "${articleText}"
         Genre List: ${JSON.stringify(genreWhitelist[type])}
         `,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let genreClassification = response.data.choices[0].message.content.trim();

    genreClassification = genreClassification
      .replace(/```json|```/g, "")
      .trim();
    return genreClassification;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
}

async function updateGenres() {
  const snapshot = await collectionRef.get();

  for (const doc of snapshot.docs) {
    const article = doc.data();
    const articleText =
      article.passage || article.content || article.text || "";
    const articleType = article.type;
    const currentGenre = article.genre;
    const currentSubgenre = article.subgenre;

    if (!["fiction", "nonfiction"].includes(articleType)) {
      console.log(`Skipping article ${doc.id} - unknown type`);
      continue;
    }

    const validGenres = genreWhitelist[articleType].map((g) => g.name);
    const validSubgenres = genreWhitelist[articleType].flatMap(
      (g) => g.subgenres
    );

    if (
      validGenres.includes(currentGenre) &&
      validSubgenres.includes(currentSubgenre)
    ) {
      console.log(`Skipping article ${doc.id} - genre and subgenre are valid`);
      continue;
    }

    const genreClassification = await classifyGenre(articleText, articleType);
    if (!genreClassification) {
      console.log(`Skipping article ${doc.id} - classification failed`);
      continue;
    }

    try {
      console.log("🔍 AI Response:", genreClassification);
      const genreData = JSON.parse(genreClassification);
      await doc.ref.update({
        genre: genreData.name,
        subgenre:
          genreData.subgenres && genreData.subgenres.length > 0
            ? genreData.subgenres[0]
            : currentSubgenre,
      });
      console.log(
        `Updated article ${doc.id} with genre: ${
          genreData.name
        }, subgenre: ${
          genreData.subgenres && genreData.subgenres.length > 0
            ? genreData.subgenres[0]
            : currentSubgenre
        }`
      );
    } catch (error) {
      console.error(`JSON Parse Error in document ${doc.id}:`, error);
      console.error("Raw AI Response:", genreClassification);
    }
  }

  console.log("Finished updating all articles.");
}

updateGenres().catch(console.error);
