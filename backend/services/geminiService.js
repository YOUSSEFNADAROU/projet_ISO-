const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_TIMEOUT = Number(process.env.GEMINI_TIMEOUT) || 30000;

function isEnabled() {
  return Boolean((GEMINI_API_KEY || '').trim());
}

function buildEndpoint() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
}

function parseGeminiJson(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch (innerError) {
      return null;
    }
  }
}

async function generateStructuredAuditResponse({ systemPrompt, userPrompt }) {
  if (!isEnabled()) {
    return {
      ok: false,
      status: 'disabled',
      sections: null,
    };
  }

  try {
    const response = await axios.post(
      buildEndpoint(),
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900,
          responseMimeType: 'application/json',
        },
      },
      {
        timeout: GEMINI_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('') || '';

    return {
      ok: true,
      status: 'ok',
      sections: parseGeminiJson(text),
    };
  } catch (error) {
    const statusCode = error.response?.status || null;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message;

    const quotaExceeded =
      statusCode === 429 || /quota|resource exhausted|rate limit|billing|exceed/i.test(message || '');

    console.error('[geminiService] Gemini fallback vers local:', {
      statusCode,
      code: error.response?.data?.error?.code || null,
      status: error.response?.data?.error?.status || null,
      message,
    });

    return {
      ok: false,
      status: quotaExceeded ? 'quota_exceeded' : 'fallback',
      sections: null,
    };
  }
}

module.exports = {
  generateStructuredAuditResponse,
  isEnabled,
};
