import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function synthetic_data_generator(
    story: string
): Promise<
    | {
        type: string;
        genre: string;
        subgenre: string;
        title: string;
        summary: string;
        image_description: string;
        passage: string;
    }
    | undefined
> {
    const prompt = `For the following content, please determine type (fiction/nonfiction), genre, and subgenre. Then create a title, a description of an image suitable to be displayed alongside and write a one-sentence summary with no spoilers.\ncontent: ${story}`;
    const schema = {
        type: "object",
        properties: {
            type: {
                type: "string",
                enum: ["fiction", "nonfiction"],
                description:
                    "fiction or non-fiction -- choose one unless you are provided one.",
            },
            genre: {
                type: "string",
                description: "Genre within that type.",
            },
            subgenre: {
                type: "string",
                description: "Subgenre within that genre.",
            },
            title: {
                type: "string",
                description: "The specific topic within that subgenre.",
            },
            summary: {
                type: "string",
                description: "A concise conclusion summarizing the key ideas.",
            },
            image_description: {
                type: "string",
                description:
                    "Create a description of an image suitable to be displayed alongside and write a one-sentence summary with no spoilers.",
            },
        },
        required: [
            "type",
            "genre",
            "subgenre",
            "title",
            "summary",
            "image_description",
        ],
    };
    try {
        const reponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an article database assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            functions: [
                {
                    name: "generate_synthetic_data",
                    description: "Generate synthetic data for a given story.",
                    parameters: schema,
                },
            ],
            function_call: {
                name: "generate_synthetic_data",
            },
            temperature: 0.7,
        });
        const data = JSON.parse(
            reponse.choices[0].message.function_call?.arguments as string
        ) as {
            type: string;
            genre: string;
            subgenre: string;
            title: string;
            summary: string;
            image_description: string;
        };
        if (
            !data.genre ||
            !data.subgenre ||
            !data.title ||
            !data.summary ||
            !data.image_description
        ) {
            throw new Error(
                "Invalid synthetic data generated. Missing required fields."
            );
        }
        return {
            type: data.type,
            genre: data.genre,
            subgenre: data.subgenre,
            title: data.title,
            summary: data.summary,
            image_description: data.image_description,
            passage: story,
        };
    } catch (error) {
        console.error("Error generating synthetic data:", error);
        return undefined;
    }
}
