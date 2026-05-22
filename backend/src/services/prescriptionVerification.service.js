const env = require('../config/env');
const { AdminValidationError } = require('../utils/admin.utils');

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const verificationSchema = {
  type: 'OBJECT',
  properties: {
    overallStatus: {
      type: 'STRING',
      enum: ['matched', 'partial_match', 'no_match', 'needs_review'],
    },
    confidence: {
      type: 'NUMBER',
    },
    detectedMedicines: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          strength: { type: 'STRING' },
          dosage: { type: 'STRING' },
          frequency: { type: 'STRING' },
          notes: { type: 'STRING' },
        },
        required: ['name', 'strength', 'dosage', 'frequency', 'notes'],
      },
    },
    orderedMedicineChecks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          orderedName: { type: 'STRING' },
          present: { type: 'BOOLEAN' },
          matchedPrescriptionName: { type: 'STRING' },
          confidence: {
            type: 'NUMBER',
          },
          reason: { type: 'STRING' },
        },
        required: ['orderedName', 'present', 'matchedPrescriptionName', 'confidence', 'reason'],
      },
    },
    summary: { type: 'STRING' },
    safetyNote: { type: 'STRING' },
  },
  required: [
    'overallStatus',
    'confidence',
    'detectedMedicines',
    'orderedMedicineChecks',
    'summary',
    'safetyNote',
  ],
};

function ensureConfigured() {
  if (!env.gemini.apiKey) {
    throw new AdminValidationError(
      'Gemini verification is not configured. Add GEMINI_API_KEY to backend/.env and restart the server.'
    );
  }

  if (typeof fetch !== 'function') {
    throw new AdminValidationError('Gemini verification requires Node.js 18 or newer.');
  }
}

function getGeminiGenerateUrl() {
  return `${GEMINI_API_BASE_URL}/${encodeURIComponent(env.gemini.model)}:generateContent`;
}

function ensurePublicUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Unsupported protocol');
    }
    return parsed.toString();
  } catch {
    throw new AdminValidationError('Prescription file must have a public URL before AI verification can run.');
  }
}

function normalizeMimeType(prescription, response) {
  const responseType = response.headers.get('content-type')?.split(';')[0]?.trim();
  const fileType = String(prescription.fileType || '').split(';')[0].trim();
  return responseType || fileType || 'application/pdf';
}

async function buildInlineFilePart(prescription) {
  const fileUrl = ensurePublicUrl(prescription.url);
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new AdminValidationError('Could not download the prescription file for Gemini verification.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new AdminValidationError('Prescription file is empty.');
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new AdminValidationError('Prescription file is too large for inline Gemini verification.');
  }

  return {
    inline_data: {
      mime_type: normalizeMimeType(prescription, response),
      data: buffer.toString('base64'),
    },
  };
}

function extractOutputText(responseData) {
  const textParts = [];
  for (const candidate of responseData?.candidates || []) {
    for (const part of candidate?.content?.parts || []) {
      if (typeof part?.text === 'string') {
        textParts.push(part.text);
      }
    }
  }

  return textParts.join('\n').trim();
}

function parseJsonOutput(outputText) {
  try {
    return JSON.parse(outputText);
  } catch {
    const match = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('Gemini verification returned invalid JSON');
  }
}

async function verifyPrescriptionAgainstOrder({ orderedMedicines, prescription }) {
  ensureConfigured();

  if (!Array.isArray(orderedMedicines) || orderedMedicines.length === 0) {
    throw new AdminValidationError('This order has no medicines to verify.');
  }

  const medicineList = orderedMedicines
    .map((item) => `- ${item.name}${item.quantity ? ` (quantity: ${item.quantity})` : ''}`)
    .join('\n');

  const filePart = await buildInlineFilePart(prescription);

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              'You help pharmacy admins verify whether ordered medicine names are present in an uploaded prescription. Extract text carefully from prescriptions, handle OCR noise, compare brand/generic names when clear, and never approve or reject clinically. Return only the requested JSON.\n\n' +
              `Prescription file: ${prescription.fileName || 'uploaded prescription'}\n\n` +
              `Ordered medicines to check:\n${medicineList}\n\n` +
              'Task: read the prescription, list medicines detected in it, and for every ordered medicine say whether it is present. If handwriting or medicine equivalence is uncertain, mark needs_review or partial_match and explain briefly.',
          },
          filePart,
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: verificationSchema,
    },
  };

  const response = await fetch(getGeminiGenerateUrl(), {
    method: 'POST',
    headers: {
      'x-goog-api-key': env.gemini.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini verification request failed';
    throw new Error(message);
  }

  const outputText = extractOutputText(data);
  if (!outputText) {
    throw new Error('Gemini verification returned no readable output');
  }

  try {
    const result = parseJsonOutput(outputText);
    return {
      model: env.gemini.model,
      checkedAt: new Date().toISOString(),
      ...result,
    };
  } catch (error) {
    throw new Error(`Gemini verification returned invalid JSON: ${error.message}`);
  }
}

module.exports = {
  verifyPrescriptionAgainstOrder,
};
