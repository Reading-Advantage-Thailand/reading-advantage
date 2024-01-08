// require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');
const rs = require('text-readability');

const serviceAccountKey = require('./service_account_key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();
const collectionRef = db.collection('articles');

collectionRef.get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
    const content = doc.data().content;
    const textStandart = rs.textStandard(content, float_output=true);
    //  console.log(content);
     console.log('textStandart', textStandart);
     
     //for update raLevel
     if(textStandart < 0) {
        //update raLevel to 0
        // console.log('raLevel', 0);
        updateRaLevel(0, doc);
     } else if (textStandart > 18) {
        //update raLevel to 18
        // console.log('raLevel', 18);
        updateRaLevel(18, doc);
     } else {
        //update raLevel to textStandart
        // console.log('raLevel', textStandart);
        updateRaLevel(textStandart, doc);
    }

     //for update cerfLevel
     if(textStandart <= 0) {
        updateCefrLevel( 'A0-', doc);
     } else if (textStandart === 1) {
        updateCefrLevel('A0', doc);
     } else if (textStandart === 2) {
        updateCefrLevel( 'A0+', doc);
     } else if (textStandart === 3) { 
        updateCefrLevel('A1', doc );
     } else if (textStandart === 4) {
        updateCefrLevel('A1+', doc );
     } else if (textStandart === 5) {
        updateCefrLevel( 'A2-', doc);
     } else if (textStandart === 6) {
        updateCefrLevel( 'A2', doc);
     } else if (textStandart === 7) {
        updateCefrLevel( 'A2+', doc);
     } else if (textStandart === 8) {
        updateCefrLevel( 'B1-', doc);
     } else if (textStandart === 9) {
        updateCefrLevel( 'B1', doc);
     } else if (textStandart === 10) {
        updateCefrLevel( 'B1+', doc);
     } else if (textStandart === 11) {
        updateCefrLevel( 'B2-', doc);
     } else if (textStandart === 12) {
        updateCefrLevel( 'B2', doc);
     } else if (textStandart === 13) {
        updateCefrLevel( 'B2+', doc);
     } else if (textStandart === 14) {
        updateCefrLevel( 'C1-', doc);
     } else if (textStandart === 15) {
        updateCefrLevel( 'C1', doc);
     } else if (textStandart === 16) {
        updateCefrLevel( 'C1+', doc);
     } else if (textStandart === 17) {
        updateCefrLevel( 'C2-', doc);
     } else if (textStandart >= 18) {
        updateCefrLevel( 'C2', doc);
     } 
    });
    console.log('Successfully updated!');
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });

function updateCefrLevel(newCefrLevel, doc) {
    db.collection('articles').doc(doc.id).update({
            cefrLevel: newCefrLevel
          });
    console.log('updateCefrLevel', newCefrLevel);
}

function updateRaLevel(textStandart, doc) {
    db.collection('articles').doc(doc.id).update({
            raLevel: textStandart
          });
    console.log('updateRaLevel', textStandart);
}
 
