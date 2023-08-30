const path = require('path');
const fs = require('fs');
const base64 = require('base64-js');
const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('./service_account_key.json');
const admin = require('firebase-admin');

// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: 'reading-advantage',
    credentials: serviceAccount,
});

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Main function
(async () => {
    const articles = require('../data/articles_firestore_with_audio.json');
    const basePath = '../data/audios/';
    const startIndex = 0;
    const endIndex = articles.length;

    console.log('Total articles:', articles.length);
    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);

    for (let i = startIndex; i < endIndex; i++) {
        console.log('Processing index:', i);
        const article = articles[i];
        const audioName = `${article.docId}.mp3`;
        const audioPath = path.join(basePath, audioName);

        // Upload audio file to Google Cloud Storage
        const bucket = storage.bucket('artifacts.reading-advantage.appspot.com');
        await bucket.upload(audioPath, {
            destination: `audios/${audioName}`,
        });
        console.log('Uploaded:', audioName);

        // Make uploaded audio file publicly accessible
        const audioFile = bucket.file(`audios/${audioName}`);
        await audioFile.makePublic();
        console.log('Updated public access:', audioName);

        // Update timepoints in Firestore
        const docRef = db.collection('articles').doc(article.docId);
        await docRef.update({
            timepoints: article.timepoints,
        });
        console.log('Updated Firestore:', article.docId);

    }

    console.log('Processing complete.');
})();
