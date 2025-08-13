import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Call Hugging Face router API
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b:cerebras", // choose any supported model
                    messages: messages,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face API error:", errorText);
            return NextResponse.json(
                { error: "Failed to fetch from Hugging Face API", details: errorText },
                { status: 500 }
            );
        }

        const result = await response.json();

        // Extract the AI's reply from Hugging Face's chat format
        const reply = result?.choices?.[0]?.message?.content || "No response generated.";

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        const e = error as any;
        console.error("Server error:", e);
        return NextResponse.json(
            { error: "Internal Server Error", details: e.message },
            { status: 500 }
        );
    }
}
