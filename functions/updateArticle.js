// require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

const serviceAccountKey = require('./service_account_key.json');
// console.log(serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();
const new_data = {
  createdAt: '2023-08-08',
  readCount: 1,
  averageRating: 3
};

const collectionRef = db.collection('articles');

collectionRef.get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const docRef = collectionRef.doc(doc.id);
      docRef.set(new_data, { merge: true })
        .then(() => {
          console.log('Data merged with document: ', doc.id);
        })
        .catch((error) => {
          console.error('Error updating document: ', error);
        });
    });
    console.log('Data merged with all documents in Firestore!');
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });
