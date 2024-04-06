import db from "@/configs/firestore-config";

export async function POST(req: Request, res: Response) {
    try {
        const { genre, type } = await req.json();
        await db.collection('articles-test').add({
            genre: genre,
            type: type,
        });
        return new Response(JSON.stringify({
            message: 'Articles generated successfully',
            genre: genre,
            type: type,
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error generating article: ${error}`,
        }), { status: 500 });
    }
}
