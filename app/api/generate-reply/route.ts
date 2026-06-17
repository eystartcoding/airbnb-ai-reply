import { NextResponse } from "next/server";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = "llama3.2";

const TONE_INSTRUCTIONS: Record<string, string> = {
  friendly:
    "Use a warm, welcoming, and approachable tone. Be enthusiastic and make the guest feel cared for.",
  professional:
    "Use a polite, clear, and business-like tone. Be courteous and efficient without being overly casual.",
  firm: "Use a direct and assertive tone. Set clear expectations while remaining respectful and professional.",
};

function buildSystemPrompt(tone: string): string {
  const toneInstruction =
    TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.friendly;

  return `You are an experienced Airbnb co-host.

The guest has already booked the property.

Your job is to write a reply that the host can directly send to the guest.

Tone: ${toneInstruction}

Rules:
- Assume self check-in is available.
- Reply directly to the guest question.
- Do not ask unnecessary questions.
- Keep the reply under 80 words.
- Sound like a real Airbnb host.
- Do not explain your reasoning.
- Only write the message to send.`;
}

export async function POST(request: Request) {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_URL;
  const ollamaModel = process.env.OLLAMA_MODEL ?? DEFAULT_OLLAMA_MODEL;

  let message: string;
  let tone = "friendly";

  try {
    const body = await request.json();
    message = body.message;
    if (body.tone && typeof body.tone === "string") {
      tone = body.tone;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!TONE_INSTRUCTIONS[tone]) {
    return NextResponse.json({ error: "Invalid tone selected." }, { status: 400 });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Guest message is required." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(tone),
          },
          { role: "user", content: message.trim() },
        ],
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error ?? "Failed to generate a reply from Ollama.";
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const reply = data.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "No reply was generated." },
        { status: 500 },
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      {
        error:
          "Cannot connect to Ollama. Make sure Ollama is running and the model is downloaded.",
      },
      { status: 503 },
    );
  }
}
