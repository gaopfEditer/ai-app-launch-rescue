import OpenAI from 'openai';

export async function summarizeText(text: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return mockSummarize(text);
  }
  try {
    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Summarize meeting notes in 2 concise sentences.' },
        { role: 'user', content: text.slice(0, 8000) },
      ],
      max_tokens: 200,
    });
    return completion.choices[0]?.message?.content?.trim() || mockSummarize(text);
  } catch (err) {
    console.error('OpenAI call failed, using mock', err);
    return mockSummarize(text);
  }
}

export function mockSummarize(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const preview = words.slice(0, 14).join(' ');
  return `[Offline mock summary] ${words.length} words captured. Highlights: ${preview || 'no content yet'}${words.length > 14 ? '…' : ''}.`;
}
