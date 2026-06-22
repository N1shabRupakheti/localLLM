import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// POST route 
export async function POST(req: Request) {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
        return new Response(
            JSON.stringify({ error: "Messages must be an array" }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {

        // get the api key 
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return Response.json(
                { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
                { status: 500 }
            );
        }

        // uses gemini model 
        const result = await streamText({
            model: google('gemini-2.5-flash'),
            messages,
        });

        return result.toTextStreamResponse();
    }
    catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }

}