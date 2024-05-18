const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountKey = require('./service_account_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();

const collectionRef = db.collection('new-articles');

collectionRef.where('type', '==', 'fiction').get()
  .then((snapshot) => {
    let data = [];
    snapshot.forEach((doc) => {
        data.push(doc.data());
    });
    
    // unique all article genre 
    // let uniqueData = Array.from(new Set(data.map(item => item.genre)))
    //   .map(genre => {
    //     return data.find(a => a.genre === genre)
    //   });

    // unique genre only
    let uniqueGenre = [...new Set(data.map(item => item.genre))];

    uniqueGenre.sort();

// Write the data to a text file
    fs.writeFile('unique_sorted_genreOnly_fiction.txt', JSON.stringify(uniqueGenre, null, 2), (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });
