// ISSUE: API key read from Vite env — bundled into client JavaScript.
const CLIENT_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function summarizeNote(text) {
  if (CLIENT_KEY && CLIENT_KEY.startsWith('sk-')) {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: CLIENT_KEY,
      dangerouslyAllowBrowser: true,
    });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Summarize meeting notes in 2 short sentences.' },
        { role: 'user', content: text },
      ],
    });
    return completion.choices[0].message.content;
  }

  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, apiKey: CLIENT_KEY }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (data.summary) return data.summary;

  return mockSummarize(text);
}

function mockSummarize(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const preview = words.slice(0, 12).join(' ');
  return `[Offline mock summary] This note covers ${words.length} words. Key theme: "${preview}${words.length > 12 ? '…' : ''}".`;
}
