/**
 * aiService.js — Powered by Google Gemini API (Free Tier)
 *
 * Setup:
 *   1. Go to: https://aistudio.google.com/app/apikey
 *   2. Click "Create API Key" — it's FREE
 *   3. Create a .env file in project root and add:
 *      VITE_GEMINI_API_KEY=your_key_here
 *   4. Restart dev server: npm run dev
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

async function callGemini(prompt) {
  if (!API_KEY) {
    throw new Error('Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.');
  }

  const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.8,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gemini AI request failed');
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// ─── 1. Generate Title ────────────────────────────────────────────────────────
export async function generateTitle(body) {
  const content = body.trim().slice(0, 600);
  if (!content) throw new Error('Write some content first so AI can suggest a title.');

  const prompt = `You are a blog title expert. Based on the blog content below, suggest exactly 3 catchy, engaging blog titles.
Return ONLY a numbered list like:
1. Title one
2. Title two
3. Title three

Blog content:
"""
${content}
"""`;

  return callGemini(prompt);
}

// ─── 2. Content Ideas ─────────────────────────────────────────────────────────
export async function suggestContent(titleOrTopic) {
  const topic = titleOrTopic.trim().slice(0, 200);
  if (!topic) throw new Error('Enter a title or topic first so AI can suggest ideas.');

  const prompt = `You are a creative blog writing assistant. For the blog topic below, suggest 3 short writing ideas or angles the author could explore. Each idea should be 1–2 sentences.

Return ONLY a numbered list like:
1. Idea one
2. Idea two
3. Idea three

Topic: "${topic}"`;

  return callGemini(prompt);
}

// ─── 3. Auto Summary ─────────────────────────────────────────────────────────
export async function generateSummary(body) {
  const content = body.trim().slice(0, 1200);
  if (!content || content.length < 80)
    throw new Error('Write at least a few sentences before generating a summary.');

  const prompt = `You are a professional editor. Summarize the blog post below in exactly 2–3 concise sentences. Return ONLY the summary, no extra text.

Blog post:
"""
${content}
"""`;

  return callGemini(prompt);
}

// ─── 4. Smart Tags ────────────────────────────────────────────────────────────
export async function generateTags(title, body) {
  const content = `${title} ${body}`.trim().slice(0, 800);
  if (!content) throw new Error('Add a title or content first so AI can suggest tags.');

  const prompt = `You are a content categorization expert. Based on the blog content below, suggest exactly 5 relevant tags/keywords.
Return ONLY a comma-separated list like: tech, coding, javascript, tutorial, beginner

Blog content:
"""
${content}
"""`;

  return callGemini(prompt);
}

// ─── Mock fallback (no API key set) ──────────────────────────────────────────
function getMockResponse(prompt) {
  if (prompt.includes('catchy, engaging blog titles')) {
    return `1. The Art of Writing Stories That Connect\n2. How to Make Your Blog Stand Out in 2025\n3. Why Every Story Deserves to Be Told`;
  }
  if (prompt.includes('writing ideas or angles')) {
    return `1. Share a personal anecdote that relates to the topic to build reader trust.\n2. Explore a common misconception and debunk it with clear examples.\n3. Compare two opposing perspectives and offer your own balanced conclusion.`;
  }
  if (prompt.includes('Summarize the blog post')) {
    return `This post explores key ideas around the topic with thoughtful insights. The author presents a clear perspective backed by examples and practical takeaways. Readers will come away with a fresh understanding of the subject.`;
  }
  if (prompt.includes('tags/keywords')) {
    return `writing, blogging, creativity, storytelling, ideas`;
  }
  return 'AI suggestion is not available for this input yet.';
}
