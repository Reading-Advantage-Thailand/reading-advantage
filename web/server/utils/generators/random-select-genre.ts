import db from "@/configs/firestore-config";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";

export interface RandomSelectGenreParams {
    type: ArticleType;
}

export interface randomSelectGenreResponse {
    genre: string;
    subgenre: string;
};

interface GenreDBType {
    id: string;
    subgenres: string[];
    name: string;
}

async function fetchGenres(type: ArticleType) {
    const genres = await db.collection(`genres-${type}`).get();
    const genre = genres.docs[
        Math.floor(Math.random() * genres.docs.length)
    ].data() as GenreDBType;
    genre.id = genres.docs[0].id;
    return {
        subgenre:
            genre.subgenres[Math.floor(Math.random() * genre.subgenres.length)],
        genre: genre.name,
    };
}

export async function randomSelectGenre(
    params: RandomSelectGenreParams
): Promise<randomSelectGenreResponse> {
    try {
        return await fetchGenres(params.type);
    } catch (error) {
        throw new Error(`failed to fetch genre: ${error}`);
    }
}
