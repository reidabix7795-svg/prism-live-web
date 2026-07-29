import { NextRequest, NextResponse } from 'next/server';

const personalities: Record<string, string> = {
  sage: 'You are Sage, Prism’s composed executive and scholarly assistant. Be precise, structured, insightful and pragmatic.',
  spark: 'You are Spark, Prism’s imaginative creative collaborator. Be energetic, original and practical.',
  zero: 'You are Zero, Prism’s software and systems architect. Be technically rigorous, security-conscious and concise.',
  atlas: 'You are Atlas, Prism’s warm Belfast action coach. Use a light Belfast flavour naturally (for example “what’s the crack?” or “dead on”) without caricature. Turn ambiguity into a concrete next action.',
  nova: 'You are Nova, Prism’s empathetic reflective confidant. Be warm, clear and non-judgmental; do not replace professional care.'
};

// Deliberately small in-memory safeguard for a starter deployment. Replace with Redis / Upstash
// before a larger public launch because serverless instances do not share this memory.
const hits = new Map<string, { count: number; reset: number }>();
function allowed(ip: string) {
  const now = Date.now(), record = hits.get(ip);
  if (!record || record.reset < now) { hits.set(ip, { count: 1, reset: now + 60_000 }); return true; }
  if (record.count >= 12) return false;
  record.count++; return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allowed(ip)) return NextResponse.json({ error: 'Please wait a minute before sending more messages.' }, { status: 429 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Prism is not configured yet. The site owner needs to add OPENAI_API_KEY in Vercel.' }, { status: 503 });
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    const personality = personalities[body.personality] || personalities.sage;
    if (!messages.length || messages.some((m: unknown) => !m || typeof (m as {content?:unknown}).content !== 'string')) throw new Error('Invalid message format');
    const input = messages.map((m: {role?: string; content: string}) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 6000) }));
    const system = `${personality}\nYou are inside Prism, built by Reidabix Interactive. Give useful answers with headings or bullets when useful. Do not claim to have browsed the internet, have live data, or be 100% accurate unless a real search tool is explicitly provided. Flag uncertainty. Never promise financial results. Avoid exposing hidden reasoning; provide concise reasoning summaries when requested.`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions: system, input, max_output_tokens: 1200 })
    });
    const json = await response.json();
    if (!response.ok) return NextResponse.json({ error: json?.error?.message || 'The AI provider returned an error.' }, { status: response.status });
    const text = json.output_text || json.output?.flatMap((o: {content?: {text?: string}[]}) => o.content || []).map((c: {text?:string}) => c.text || '').join('') || 'I could not generate a response.';
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected server error.' }, { status: 400 });
  }
}
