// require('dotenv').config({ path: './config.env' });
const admin = require('firebase-admin');

const serviceAccountKey = require('./service_account_key.json');
// console.log(serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const genreMapping = {
    "Adventure":"Adventure and Travel",
"Art":"Art and Culture",
"Art History":"Art and Culture",
"Art and Culture":"Art and Culture",
"Art and Environment":"Art and Culture",
"Art and Technology":"Art and Culture",
"Arts":"Art and Culture",
"Crossover":"Art and Culture",
"Visual Arts":"Art and Culture",
"Culture":"Art and Culture",
"Cultural":"Art and Culture",
"Cultural Celebration":"Art and Culture",
"Cultural Event":"Art and Culture",
"Cultural Studies":"Art and Culture",
"Entertainment":"Art and Culture",
"Film":"Art and Culture",
"Film Analysis":"Art and Culture",
"Media":"Art and Culture",
"Media and Film Studies":"Art and Culture",
"Music":"Art and Culture",
"Biography":"Biography and Memoir",
"Memoir":"Biography and Memoir",
"Memoirs and Autobiographies":"Biography and Memoir",
"Biology":"Science and Nature",
"Botany":"Science and Nature",
"Earth Science":"Science and Nature",
"Environmental Science":"Science and Nature",
"Natural Disasters":"Science and Nature",
"Natural History":"Science and Nature",
"Natural Science":"Science and Nature",
"Natural Sciences":"Science and Nature",
"Nature":"Science and Nature",
"Paleontology":"Science and Nature",
"Cryptozoology":"Science and Nature",
"Children's":"Science and Nature",
"Culinary Arts":"Food and Culinary Arts",
"Food":"Food and Culinary Arts",
"Food and Cooking":"Food and Culinary Arts",
"Food and Dining":"Food and Culinary Arts",
"Food and Drink":"Food and Culinary Arts",
"Health":"Health and Wellness",
"Health and Fitness":"Health and Wellness",
"Health and Nutrition":"Health and Wellness",
"Health and Wellness":"Health and Wellness",
"Healthcare":"Health and Wellness",
"Education":"Education",
"Education and Technology":"Education",
"Educational":"Education",
"Social Issues":"Social Sciences and Issues",
"Social Media":"Social Sciences and Issues",
"Social Sciences":"Social Sciences and Issues",
"Sociology":"Social Sciences and Issues",
"Political Science":"Social Sciences and Issues",
"Interdisciplinary Studies":"Social Sciences and Issues",
"History":"History and Mythology",
"Mythology":"History and Mythology",
"Language":"Language and Literature",
"Language Learning":"Language and Literature",
"Language and Communication":"Language and Literature",
"Communication":"Language and Literature",
"Literary Criticism":"Language and Literature",
"Literature":"Language and Literature",
"Writing":"Language and Literature",
"Professional":"Professional and Personal Development",
"Professional Development":"Professional and Personal Development",
"Personal Finance":"Professional and Personal Development",
"Self-Help":"Professional and Personal Development",
"self-help":"Professional and Personal Development",
"Philosophy":"Philosophy and Religion",
"Religion":"Philosophy and Religion",
"Religion and Spirituality":"Philosophy and Religion",
"Psychology":"Psychology",
"Travel":"Adventure and Travel",
"Travel Guide":"Adventure and Travel",
"Sports":"Sports",
"Science":"Technology and Science",
"Science and Technology":"Technology and Science",
"Technology":"Technology and Science",
"Technology and Art":"Technology and Science",
"True Crime":"True Crime and Paranormal",
"Paranormal":"True Crime and Paranormal",
"Horror":"True Crime and Paranormal",
"Horror Legends":"True Crime and Paranormal",
"Family":"Family and Parenting",
"Parenting":"Family and Parenting"
}

const db = admin.firestore();

const collectionRef = db.collection('new-articles');

collectionRef.get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
    const article = doc.data();
    const oldGenre = article.genre;
    const articleType = article.type;

    if (genreMapping.hasOwnProperty(oldGenre) && articleType === 'nonfiction') {
       const newGenre = genreMapping[oldGenre];
       doc.ref.update({ genre: newGenre})
         .then(() => {
           console.log('Data merged with document: ', doc.id);
         })
         .catch((error) => {
           console.error('Error updating document: ', error);
         });
    }
    });
    console.log('Data merged with all documents in Firestore!');
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });
