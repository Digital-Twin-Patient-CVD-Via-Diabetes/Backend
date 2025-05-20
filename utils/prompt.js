import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function getMedicationInfo(medName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Please set the GEMINI_API_KEY environment variable');
  }

  const prompt = `
You are a medical-data assistant. When given the name of a medicine, you must output a JSON object with exactly three properties:

  • Medication: { type: String, required: true }
  • specialization: { type: String, required: true }
  • Influence: { type: String, required: true }

Always:
  1. Use the exact property names and casing shown above.
  2. Wrap property names in double quotes.
  3. Wrap string values in double quotes.
  4. Output only valid JSON (no extra commentary).

Input: ${medName}
  `;

  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const url = `${endpoint}?key=${apiKey}`;
  const body = JSON.stringify({
    contents: [
      { parts: [{ text: prompt }] }
    ]
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error(`Unexpected API response format: ${JSON.stringify(data)}`);
  }

  let cleaned = raw.trim();
  if (cleaned.startsWith('json')) {
    cleaned = cleaned.replace(/^json\s*/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err.message}\nContent was: ${cleaned}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const med = process.argv[2];
  if (!med) {
    console.error('Usage: node script.js <medicine name>');
    process.exit(1);
  }
  getMedicationInfo(med)
    .then(info => console.log(JSON.stringify(info, null, 2)))
    .catch(err => console.error('Error:', err.message));
}

export { getMedicationInfo };
