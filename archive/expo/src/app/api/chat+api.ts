import { createAnthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, streamText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    return new Response('Missing EXPO_PUBLIC_ANTHROPIC_API_KEY', { status: 500 });
  }

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: `You are the Mytabolism Personalized Health Concierge. Your objective is to help the user unlock their peak metabolic energy blueprint. Cross-reference logged inputs with historical bio-markers. Never give boilerplate text. End every message with an inquisitive, targeted question to uncover user habits.`,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  });
}