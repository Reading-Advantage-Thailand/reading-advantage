const admin = require('firebase-admin');

const serviceAccountKey = require('./service_account_key.json');
// console.log(serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();;

async function updateRating(articleId) {
  try {
    const fetchData = async() => {
        const articleSnapshot = await db.collection('new-articles')
          .doc(articleId).get();
        return articleSnapshot
    }  
    const articleSnapshot = await fetchData()
    const articleData = articleSnapshot.data();
      if (articleData) {
          const { ra_level } = articleData;
          const type = articleData.type
          const genre = articleData.genre.replace(/ /g, "_")
          const subgenre = articleData.subgenre.replace(/ /g, "_")

          // console.log("type:", type);
          // console.log("genre:", genre);
          // console.log("subgenre:", subgenre);
          // console.log("id:", id);
          // console.log("level", ra_level)

          // ตรวจสอบว่าค่าทุกตัวไม่เป็นค่าว่างหรือ undefined
          if (type && genre && subgenre) {
              const average_rating = await averageRating(articleId, 3)
              const selectSnapshot = await db.collection('article-selection')
                  .doc(ra_level.toString())
                  .collection('types').doc(type)
                  .collection('genres').doc(genre)
                  .collection('subgenres').doc(subgenre)
                  .collection('articles').doc(articleId)
                  .update({
                    average_rating: average_rating,
                    // totalRatings: newTotalRatings,
                });

              // Log the data from the selectSnapshot
              return console.log("updated successful!");
          } else {
              console.error("One or more required fields are missing in article data");
          }
      } else {
          console.error("No article data found");
      }
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

updateRating("hN4Oxt00aeME5MrBn2Z0").then((res) => res).then((error) => error);

async function averageRating(articleIdInput, rateCurr){
 const userSnapshot = await db.collection('users').get();
 const userDocs = userSnapshot.docs;
 const arrData = [];
 for(let i=0; i<userDocs.length; i++){
  const doc = userDocs[i]
  const userId = doc.data().id;
  // arr.push(data.id)
  const articleRecord = await db.collection('users').doc(userId)
  .collection('article-records').get()
  const recordsDoc = articleRecord.docs

  for(let j=0; j<recordsDoc.length; j++){
   const docArticle = recordsDoc[j]
   const articleId = docArticle.data().id
   if(articleId === articleIdInput){
    // console.log(docArticle.data())
    if(docArticle.data().rated !== 0){
     arrData.push(docArticle.data().rated)
    } 
   }
  }
 }

 let summaryRating = arrData.map((rate) => rate += rate)
 summaryRating = Array.isArray(summaryRating) && summaryRating.length == 0 ? 0 : summaryRating
 let result = 0;
 if(summaryRating === 0){
  result = rateCurr
 } else{
  result = summaryRating + rateCurr / arrData.length + 1
 }
 
 return result
}


