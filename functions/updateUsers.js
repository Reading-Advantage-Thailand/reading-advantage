// require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

const serviceAccountKey = require('./service_account_key.json');
// console.log(serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();
const new_data = {
  cefrLevel: '',
  level: 0,
  xp: 0,
};

const collectionRef = db.collection('users');

collectionRef.get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const docRef = collectionRef.doc(doc.id);
      docRef.set(new_data, { merge: true })
        .then(() => {
          console.log('Data merged with users: ', doc.id);
        })
        .catch((error) => {
          console.error('Error updating users: ', error);
        });
    });
    console.log('Data merged with all users in Firestore!');
  })
  .catch((error) => {
    console.error('Error getting users: ', error);
  });
