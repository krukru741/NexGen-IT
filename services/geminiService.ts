import { GoogleGenAI } from "@google/genai";
import { TicketPriority, TicketCategory } from "../types";

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client", e);
}

export const analyzeTicketDraft = async (description: string): Promise<{ category: TicketCategory, priority: TicketPriority, summary: string } | null> => {
  if (!ai) return null;

  try {
    const prompt = `
      Analyze this IT support ticket description: "${description}".
      
      Return a JSON object with:
      1. 'category' (One of: HARDWARE, SOFTWARE, NETWORK, ACCESS, OTHER)
      2. 'priority' (One of: LOW, MEDIUM, HIGH, CRITICAL)
      3. 'summary' (A 5-10 word title for the ticket)

      JSON format only. No markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return null;
  }
};

export const suggestSolution = async (ticketDescription: string, logs: string[]): Promise<string | null> => {
  if (!ai) return null;

  try {
    const prompt = `
      You are a senior IT technician.
      Ticket Issue: "${ticketDescription}"
      Previous Logs: ${logs.join(' | ')}

      Provide a concise, professional technical suggestion for the next step or solution. Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || null;
  } catch (error) {
    console.error("Gemini suggestion failed", error);
    return null;
  }
};

export const improveTicketDescription = async (description: string): Promise<string | null> => {
  if (!ai) return null;

  try {
    const prompt = `
      Rewrite the following IT support ticket description to be more clear, professional, and structured. 
      Maintain all technical details.
      
      Original: "${description}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || null;
  } catch (error) {
    console.error("Gemini refinement failed", error);
    return null;
  }
};