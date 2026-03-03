import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import type { Part } from '@google/generative-ai';
import type { Message, Settings } from '../types';

function buildClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

function buildHistory(messages: Message[]) {
  return messages.slice(0, -1).map((msg) => {
    const parts: Part[] = [];
    if (msg.images) {
      for (const img of msg.images) {
        const match = img.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
    }
    parts.push({ text: msg.content || '' });
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts,
    };
  });
}

function buildCurrentParts(message: Message): Part[] {
  const parts: Part[] = [];
  if (message.images) {
    for (const img of message.images) {
      const match = img.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }
  }
  if (message.content) parts.push({ text: message.content });
  return parts;
}

function getAgentSystemInstruction(base: string): string {
  return (
    base +
    '\n\nYou are running in AGENT MODE. When given a complex task:\n' +
    '1. Break it down into clear steps.\n' +
    '2. Work through each step thoroughly and completely.\n' +
    '3. Show your reasoning and progress.\n' +
    '4. Provide complete, production-ready solutions, not stubs.\n' +
    '5. If writing code, write the full, working implementation.\n' +
    '6. Double-check your work before finishing.'
  );
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onThinking: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export async function streamChatResponse(
  messages: Message[],
  settings: Settings,
  callbacks: StreamCallbacks
) {
  const { apiKey, model, systemPrompt, temperature, thinkingEnabled, agentMode } = settings;

  if (!apiKey) {
    callbacks.onError(new Error('No API key configured. Please add your Gemini API key in Settings.'));
    return;
  }

  const client = buildClient(apiKey);

  const systemInstruction = agentMode
    ? getAgentSystemInstruction(systemPrompt)
    : systemPrompt;

  const generationConfig: Record<string, unknown> = {
    temperature,
  };

  if (agentMode) {
    generationConfig.maxOutputTokens = 65536;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelConfig: any = {
    model,
    systemInstruction: systemInstruction || undefined,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig,
  };

  if (thinkingEnabled) {
    modelConfig.generationConfig = {
      ...generationConfig,
      thinkingConfig: { thinkingBudget: -1 },
    };
  }

  const genModel = client.getGenerativeModel(modelConfig);

  const lastMessage = messages[messages.length - 1];
  const history = buildHistory(messages);
  const currentParts = buildCurrentParts(lastMessage);

  try {
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessageStream(currentParts);

    for await (const chunk of result.stream) {
      const candidates = chunk.candidates;
      if (!candidates) continue;

      for (const candidate of candidates) {
        if (!candidate.content?.parts) continue;
        for (const part of candidate.content.parts) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = part as any;
          if (p.thought === true && p.text) {
            callbacks.onThinking(p.text);
          } else if (p.text) {
            callbacks.onChunk(p.text);
          }
        }
      }
    }

    callbacks.onDone();
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
