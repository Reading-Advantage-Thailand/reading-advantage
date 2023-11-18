//route
// api/articles?level=1&type=fiction&genre=animals
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(req: Request, res: Response) {
    const url = new URL(req.url as string);
    let level = url.searchParams.get('level');
    const levelInt = parseInt(level as string);
    let type = url.searchParams.get('type')
    const genre = url.searchParams.get('genre')
    const subgenre = url.searchParams.get('subgenre')

    // function to replace all dashes with spaces
    function replaceSpaces(str: string) {
        return str.replace(/-/g, ' ');
    }
    console.log('level', level);
    console.log('type', type);
    if (genre) console.log('genre', replaceSpaces(genre as string));
    if (subgenre) console.log('subgenre', replaceSpaces(subgenre as string));
    try {
        // Conditionally add filters based on the presence of search parameters
        // if (type) articlesQuery = articlesQuery.where('type', '==', genre)
        // if (genre) articlesQuery = articlesQuery.where('genre', '==', replaceSpaces(genre))
        // if (subgenre) articlesQuery = articlesQuery.where('subgenre', '==', replaceSpaces(subgenre))

        // Filter out and reponse in search from params in url query only
        // Types response data
        // data: ['fiction', 'non-fiction']
        if (level && !type && !genre && !subgenre) {
            return new Response(JSON.stringify({
                data: ['Fiction', 'Non-fiction'],
            }), { status: 200 })
        }

        // Genres response data
        // data: ['animals', 'biography', 'history', 'science']
        if (level && type && !genre && !subgenre) {
            console.log('setsdc')
            // Start with a base query
            const articlesQuery = db.collection('articles')
                .where('raLevel', '>=', levelInt - 2)
                .where('raLevel', '<=', levelInt + 2)
                .where('type', '==', type)
            const articlesSnapshot = await articlesQuery.get();
            const articles: FirebaseFirestore.DocumentData[] = [];

            articlesSnapshot.forEach((doc: any) => {
                const genre = doc.data().genre;
                console.log('genre', genre);
                if (!articles.includes(genre)) {
                    articles.push(genre);
                }
            });
            return new Response(JSON.stringify({
                data: articles,
            }), { status: 200 })
        }
        // Subgenres response data
        // data: ['animals', 'biography', 'history', 'science']
        // article: null
        if (level && type && genre && !subgenre) {
            console.log('testttttt');
            // Start with a base query
            const articlesQuery = db.collection('articles')
                .where('raLevel', '>=', levelInt - 2)
                .where('raLevel', '<=', levelInt + 2)
                .where('type', '==', type)
                .where('genre', '==', replaceSpaces(genre))
            const articlesSnapshot = await articlesQuery.get();
            const articles: FirebaseFirestore.DocumentData[] = [];

            articlesSnapshot.forEach((doc) => {
                const subGenre = doc.data().subGenre;
                if (!articles.includes(subGenre)) {
                    articles.push(subGenre);
                }
            });
            return new Response(JSON.stringify({
                data: articles,
            }), { status: 200 })
        }
        // Articles response data
        // data: ['article1', 'article2', 'article3', 'article4']
        // article: ...
        if (level && type && genre && subgenre) {
            const session = await getServerSession(authOptions);
            console.log('sessionaskdksadj', session);
            if (!session) {
                return new Response(JSON.stringify({
                    message: 'Unauthorized',
                }), { status: 403 })
            }

            // Start with a base query
            const articlesQuery = db.collection('articles')
                .where('raLevel', '>=', levelInt - 2)
                .where('raLevel', '<=', levelInt + 2)
                .where('type', '==', type)
                .where('genre', '==', replaceSpaces(genre))
                .where('subGenre', '==', replaceSpaces(subgenre))

            const articles: FirebaseFirestore.DocumentData[] = [];

            const articlesSnapshot = await articlesQuery.get();

            const userId = session.user.id;
            for (let i = 0; i < articlesSnapshot.size; i++) {
                const articleId = articlesSnapshot.docs[i].id;
                console.log('articleId', articleId);
                const articleRecord = db.collection('user-article-records').doc(`${userId}-${articleId}`);
                const articleRecordSnapshot = await articleRecord.get();
                const userArticleRecord = articleRecordSnapshot.data();
                console.log('userArticleRecord', userArticleRecord);
                console.log('userArticleRecord', userArticleRecord ? true : false);
                articles.push({
                    articleId: articlesSnapshot.docs[i].id,
                    type: articlesSnapshot.docs[i].data().type,
                    subgenre: articlesSnapshot.docs[i].data().subGenre,
                    genre: articlesSnapshot.docs[i].data().genre,
                    raLevel: articlesSnapshot.docs[i].data().raLevel,
                    title: articlesSnapshot.docs[i].data().title,
                    cefrLevel: articlesSnapshot.docs[i].data().cefrLevel,
                    summary: 'wait for summary',
                    isRead: userArticleRecord ? true : false,
                    status: userArticleRecord?.status,
                });
            }
            // articlesSnapshot.forEach(async (doc) => {
            //     // const articleId = doc.id;
            //     // console.log('articleId', articleId);
            //     // console.log('userId', userId);
            //     // const articleRecord = db.collection('user-article-records').doc(`${session.user.id}-${articleId}`);
            //     // const userArticleRecord = articleRecordSnapshot.data();
            //     // console.log('userArticleRecord', userArticleRecord);
            //     // const userArticleRecord = userArticleRecordSnapshot.data();
            //     // let isRead = false;
            //     // if (userArticleRecord) {
            //     //     isRead = true;
            //     // }
            //     articles.push({
            //         articleId: doc.id,
            //         type: doc.data().type,
            //         subgenre: doc.data().subGenre,
            //         genre: doc.data().genre,
            //         raLevel: doc.data().raLevel,
            //         title: doc.data().title,
            //         cefrLevel: doc.data().cefrLevel,
            //         summary: 'wait for summary',
            //         // isRead,
            //         // status: userArticleRecord?.status,
            //     });
            // });
            console.log('articles', articles);

            return new Response(JSON.stringify({
                data: articles,
                // articleId: randomArticle.id,
            }), { status: 200 })
        }


        return new Response(JSON.stringify({
            data: [],
        }), { status: 404 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: 'Internal server error'
        }), { status: 500 })
    }
};