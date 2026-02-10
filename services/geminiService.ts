
import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (userPrompt: string, contextFiles: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a Senior PHP Software Architect. You have designed the following e-commerce project using PHP 8, MVC, and a custom framework.
    Your goal is to explain architectural decisions, security features (CSRF, SQLi protection, etc.), and help the developer understand the code.
    
    Context Code Summary:
    ${contextFiles.map(f => `File: ${f.path}\nContent: ${f.content.substring(0, 500)}...`).join('\n\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with the PHP Architect Assistant.";
  }
};
