
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async *streamChat(messages: Message[]): AsyncGenerator<string> {
    try {
      // Filter out system messages if any, and map to Gemini format
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const lastMessage = messages[messages.length - 1].content;

      const chat = this.ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: "You are Gemini, a helpful and highly intelligent AI assistant developed by Google. You provide clear, accurate, and concise answers. Use markdown for formatting. For code blocks, always specify the language.",
          temperature: 0.7,
        }
      });

      // Gemini Chat API uses startChat/sendMessageStream pattern
      // However, for simplicity and to follow provided guidelines precisely:
      const responseStream = await chat.sendMessageStream({ message: lastMessage });

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
