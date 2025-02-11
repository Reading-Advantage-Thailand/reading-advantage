const admin = require('firebase-admin');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const serviceAccountKey = require('./service_account_key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();
const collectionRef = db.collection('new-articles');

const fictionGenres = JSON.parse(fs.readFileSync('./web/data/genres-fiction.json', 'utf8'));
const nonFictionGenres = JSON.parse(fs.readFileSync('./web/data/genres-nonfiction.json', 'utf8'));

const genreWhitelist = {
  fiction: fictionGenres.Genres,
  nonfiction: nonFictionGenres.Genres
};

async function classifyGenre(articleText, type) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: "You are an AI trained to categorize articles based on a given genre list." },
        { role: 'user', content: `Look at the given article and choose the most appropriate genre and associated subgenre from the given list.
         You must return only whitelisted genres and subgenres.
         
         Article: "${articleText}"
         Genre List: ${JSON.stringify(genreWhitelist[type])}
         ` }
      ],
      temperature: 0.7,
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
}

async function updateGenres() {
  const snapshot = await collectionRef.get();

  for (const doc of snapshot.docs) {
    const article = doc.data();
    const articleText = article.content || article.text || "";
    const articleType = article.type;

    if (!['fiction', 'nonfiction'].includes(articleType)) {
      console.log(`Skipping article ${doc.id} - unknown type`);
      continue;
    }

    const genreClassification = await classifyGenre(articleText, articleType);
    if (!genreClassification) {
      console.log(`Skipping article ${doc.id} - classification failed`);
      continue;
    }

    try {
      await doc.ref.update({ genre: genreClassification });
      console.log(`Updated article ${doc.id} with genre: ${genreClassification}`);
    } catch (error) {
      console.error(`Error updating document ${doc.id}:`, error);
    }
  }

  console.log('Finished updating all articles.');
}

updateGenres().catch(console.error);
