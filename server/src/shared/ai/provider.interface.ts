export interface AiProvider {
  id: string; // e.g. 'google'
  name: string;
  
  /**
   * Invokes the model with structured output mapping.
   * Returns a raw JSON string from the model.
   */
  callModel(
    modelId: string, 
    prompt: string, 
    systemInstruction: string, 
    responseSchema: any
  ): Promise<string>;
}
