import db from '@/configs/firestore-config';

export async function GET (req: Request) {
  const collectionRef = db.collection('new-articles');
  const allArticlesSnapshot = await collectionRef.get();

  const articlesByLevel: { [key: string]: number } = {};

    allArticlesSnapshot.forEach(doc => {
        const article = doc.data();
        const level = article.cefr_level;
        if (!articlesByLevel[level]) {
        articlesByLevel[level] = 1;
        } else {
            articlesByLevel[level]++;
        }
    });

// const query = collectionRef.where('cefr_level', '==', 'A0');
// const snapshot = await query.count().get();

  return new Response(
    JSON.stringify({
      data: articlesByLevel,
    }),
    { status: 200 }
  );

}

