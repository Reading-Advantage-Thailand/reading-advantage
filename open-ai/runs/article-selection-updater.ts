import db from "../configs/firebase_config";
import dotenv from 'dotenv';

dotenv.config();

async function articleSelectionUpdater() {
    const resp = await db.collection("new-articles").get();
    const articles = resp.docs.map((doc) => {
        return {
            ...doc.data(),
        };
    });
    let count = {} as any;

    // Count types
    for (let i = 0; i < articles.length; i++) {
        try {
            let { ra_level, type, title, summary, cefr_level, genre, subgenre, id } = articles[i];

            if (!ra_level && ra_level != 0 || !type || !genre || !subgenre || !id) {
                console.error("Invalid article data:", articles[i]);
                console.log('invalid fields: ', ra_level, type, genre, subgenre, id);
                continue;
            }

            ra_level = ra_level.toString();
            type = type.replace(/ /g, '_');
            genre = genre.replace(/ /g, '_');
            subgenre = subgenre.replace(/ /g, '_');

            console.log('id: ', id);

            //  Count types 
            if (!count[ra_level]) {
                count[ra_level] = {};
            }
            if (!count[ra_level][type]) {
                count[ra_level][type] = 0;
            }
            count[ra_level][type] += 1;

        } catch (error) {
            console.error("Error updating article selector:", error);
            console.log('i', i);
            console.log('articles[i]', articles[i].id);
        }
    }
    // Update count
    for (const level in count) {
        const levelString = level.toString();
        for (const type in count[levelString]) {
            console.log('levelString: ', levelString, 'type: ', type, 'count: ', count[levelString][type]);
            await db.collection("article-selection").doc(levelString).set(count[levelString]);
        }
    }

    count = {} as any;
    // Count genrea
    for (let i = 0; i < articles.length; i++) {
        let { ra_level, type, title, summary, cefr_level, genre, subgenre, id } = articles[i];

        if (!ra_level && ra_level != 0 || !type || !genre || !subgenre || !id) {
            console.error("Invalid article data:", articles[i]);
            console.log('invalid fields: ', ra_level, type, genre, subgenre, id);
            continue;
        }

        ra_level = ra_level.toString();
        type = type.replace(/ /g, '_');
        genre = genre.replace(/ /g, '_');
        subgenre = subgenre.replace(/ /g, '_');

        console.log('id: ', id);

        // Count genres
        if (!count[ra_level]) {
            count[ra_level] = {};
        }
        if (!count[ra_level][type]) {
            count[ra_level][type] = {};
        }
        if (!count[ra_level][type][genre]) {
            count[ra_level][type][genre] = 0;
        }
        count[ra_level][type][genre] += 1;

    }

    // Update count
    for (const level in count) {
        let levelString = level.toString();
        for (const type in count[levelString]) {
            for (const genre in count[levelString][type]) {
                await db.collection("article-selection").doc(levelString).collection("types").doc(type).set(count[levelString][type]);
            }
        }
    }

    count = {} as any;
    // Count subgenres
    for (let i = 0; i < articles.length; i++) {
        let { ra_level, type, title, summary, cefr_level, genre, subgenre, id } = articles[i];

        if (!ra_level && ra_level != 0 || !type || !genre || !subgenre || !id) {
            console.error("Invalid article data:", articles[i]);
            console.log('invalid fields: ', ra_level, type, genre, subgenre, id);
            continue;
        }

        ra_level = ra_level.toString();
        type = type.replace(/ /g, '_');
        genre = genre.replace(/ /g, '_');
        subgenre = subgenre.replace(/ /g, '_');

        console.log('id: ', id);

        // Count subgenres
        if (!count[ra_level]) {
            count[ra_level] = {};
        }
        if (!count[ra_level][type]) {
            count[ra_level][type] = {};
        }
        if (!count[ra_level][type][genre]) {
            count[ra_level][type][genre] = {};
        }
        if (!count[ra_level][type][genre][subgenre]) {
            count[ra_level][type][genre][subgenre] = 0;
        }
        count[ra_level][type][genre][subgenre] += 1;
    }

    // Update count
    for (const level in count) {
        const levelString = level.toString();
        for (const type in count[levelString]) {
            for (const genre in count[levelString][type]) {
                for (const subgenre in count[levelString][type][genre]) {
                    await db.collection("article-selection").doc(levelString).collection("types").doc(type).collection("genres").doc(genre).set(count[levelString][type][genre]);
                }
            }
        }
    }

    count = {} as any;
    for (let i = 0; i < articles.length; i++) {
        let { ra_level, type, title, summary, cefr_level, genre, subgenre, id } = articles[i];

        if (!ra_level && ra_level != 0 || !type || !genre || !subgenre || !id) {
            console.error("Invalid article data:", articles[i]);
            console.log('invalid fields: ', ra_level, type, genre, subgenre, id);
            continue;
        }
        ra_level = ra_level.toString();
        type = type.replace(/ /g, '_');
        genre = genre.replace(/ /g, '_');
        subgenre = subgenre.replace(/ /g, '_');

        await db.collection("article-selection")
            .doc(ra_level).collection("types")
            .doc(type).collection("genres")
            .doc(genre).collection("subgenres")
            .doc(subgenre).collection("articles")
            .doc(id).set({
                id,
                title,
                summary,
                cefr_level,
                ra_level,
                average_rating: 0,
            });
    }

    console.log('articles: ', articles.length);
    // console.log('count: ', count);
}

articleSelectionUpdater();