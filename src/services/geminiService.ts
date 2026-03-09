import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateFinancialInsights(data: any) {
  try {
    const prompt = `
      Analyze the following personal finance data for a Gen Z user in India and provide 3-4 short, punchy, and motivating insights in JSON format.
      Data: ${JSON.stringify(data)}
      
      The response should be a JSON array of objects with 'text' and 'type' (positive, warning, info).
      Example: [{"text": "You spent 42% of your income on food this month.", "type": "warning"}]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["text", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      { text: "Track more expenses to get personalized AI insights!", type: "info" }
    ];
  }
}
