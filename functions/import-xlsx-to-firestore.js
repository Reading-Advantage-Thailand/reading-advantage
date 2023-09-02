const admin = require('firebase-admin');
const serviceAccount = require('./service_account_key.json');
const xlsx = require('xlsx');
const fs = require('fs');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// convert xlsx to json
const workbook = xlsx.readFile('../data/GSE_Academic_Reading_Descriptors.xlsx');
const sheetNameList = workbook.SheetNames;
const json = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

// Define the Firestore collection name
const collectionName = 'reading-descriptors';

// Map and write data to Firestore
Promise.all(
    json.map((item, index) => {
        console.log(`Writing document ${index}`);
        return db.collection(collectionName).add({
            descriptors: item.Descriptors,
            skill: item.Skill,
            // number
            gse: parseInt(item.GSE),
            cefr: item.CEFR,
        });
    })
)
    .then(() => {
        console.log('All documents written to Firestore successfully.');
    })
    .catch((error) => {
        console.error('Error writing documents to Firestore: ', error);
    });
