// update a question to firestore

const fs = require('fs');
const admin = require('firebase-admin');

const serviceAccount = require('./service_account_key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
    const questionsJson = require('../data/generatedQuestion.json');

    for (let i = 0; i < questionsJson.length; i++) {
        const questions = questionsJson[i].questions;
        // console.log(questions);

        // update question to firestore by id
        const questionRef = db.collection('articles').doc(questionsJson[i].docId);
        await questionRef.update({
            questions: questions
        });

        console.log(`Updated question ${i} ${questionsJson[i].docId}`);
    }
})();