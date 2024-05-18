const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountKey = require('./service_account_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();

const collectionRef = db.collection('new-articles');

collectionRef.where('type', '==', 'nonfiction').get()
  .then((snapshot) => {
    let data = [];
    snapshot.forEach((doc) => {
        let docData = doc.data();   
        data.push(
            {
                genre: docData.genre,
                subgenre: docData.subgenre
            }
        );
    });
    
    // unique genre only
   let sortedUniqueData = Array.from(data.reduce((map, obj) => map.set(obj.genre + obj.subgenre, obj), new Map()).values());

   sortedUniqueData.sort((a, b) => {
    let genreComparison = a.genre.localeCompare(b.genre);
    if (genreComparison !== 0) return genreComparison;
      return a.subgenre.localeCompare(b.subgenre);
   });

   let fileData = {
    data: sortedUniqueData
   }


// Write the data to a text file
    fs.writeFile('../data/sorted_subgenreOnly_nonfiction.txt', JSON.stringify(fileData, null, 2), (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });
