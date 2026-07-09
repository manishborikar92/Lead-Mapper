import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.config.js';
import { AiProvider } from './provider.interface.js';

export class GoogleGeminiProvider implements AiProvider {
  public readonly id = 'google';
  public readonly name = 'Google Gemini';
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Load Gemini API Key from validated central config
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async callModel(
    modelId: string,
    prompt: string,
    systemInstruction: string,
    responseSchema: any
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1 // Highly deterministic extraction
      },
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text) {
      throw new Error(`Empty response returned from model: ${modelId}`);
    }
    
    return text;
  }
}
