import catchAsync from "../utils/catchAsync";
import db from "../config/firebaseConfig";

const getGenreByTypeAndLevel = catchAsync(async (req, res) => {
    const type = req.params.type;
    const level = parseInt(req.params.level);
    // replace dashes with spaces
    const data: FirebaseFirestore.DocumentData[] = [];
    //find level +/- 2 from article level
    const typesSnapshot = await db.collection('articles')
        .where('raLevel', '>=', level - 2)
        .where('raLevel', '<=', level + 2)
        .where('type', '==', type)
        .get();
    // Iterate through the snapshot and add unique genres to the data array
    typesSnapshot.forEach((doc) => {
        const genre = doc.data().genre;
        if (!data.includes(genre)) {
            data.push(genre);
        }
    });

    res.status(200).json({
        status: 'success',
        result: data.length,
        data: {
            genres: data,
        }
    });
});

const getSubgenreByGenreAndTypeAndLevel = catchAsync(async (req, res) => {
    const type = req.params.type;
    const level = parseInt(req.params.level);
    // replace dashes with spaces
    const genre = req.params.genre.replace(/-/g, ' ');

    const data: FirebaseFirestore.DocumentData[] = [];
    //find level +/- 2 from article level
    const typesSnapshot = await db.collection('articles')
        .where('raLevel', '>=', level - 2)
        .where('raLevel', '<=', level + 2)
        .where('type', '==', type)
        .where('genre', '==', genre)
        .get();
    // Iterate through the snapshot and add unique genres to the data array
    typesSnapshot.forEach((doc) => {
        const subGenre = doc.data().subGenre;
        if (!data.includes(subGenre)) {
            data.push(subGenre);
        }
    });

    res.status(200).json({
        status: 'success',
        result: data.length,
        data: {
            subGenres: data,
        }
    });
});

const getArticleByGenreAndSubGenreAndTypeAndLevel = catchAsync(async (req, res) => {
    const type = req.params.type;
    const level = parseInt(req.params.level);
    // replace dashes with spaces
    const genre = req.params.genre.replace(/-/g, ' ');
    const subgenre = req.params.subgenre.replace(/-/g, ' ');

    //find level +/- 2 from article level
    const articlesSnapshot = await db.collection('articles')
        .where('raLevel', '>=', level - 2)
        .where('raLevel', '<=', level + 2)
        .where('type', '==', type)
        .where('genre', '==', genre)
        .where('subGenre', '==', subgenre)
        .orderBy('raLevel')
        .get();
    const article = articlesSnapshot.docs[0].data();
    res.status(200).json({
        status: 'success',
        data: {
            article,
        }
    });
});
export default {
    getGenreByTypeAndLevel,
    getSubgenreByGenreAndTypeAndLevel,
    getArticleByGenreAndSubGenreAndTypeAndLevel
};