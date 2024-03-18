import { articleGenerator } from "@/controllers/assistantController";

export async function POST(req: Request, res: Response) {
    try {
        const { userId} = await req.json();
        const generateArticle = articleGenerator(userId);
        return new Response(JSON.stringify({
            status: 'success',
            data: generateArticle,
        }), { status: 200 });
    } catch (error) {
        console.error('ERROR GENERATING ARTICLE: ', error);
        return new Response(JSON.stringify({
            message: 'Error generating article',
            error: error,
        }), { status: 500 });
    }
}
