import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, Message, EvaluationResult, EvaluationModule, UserProfileType } from "../types";
import { SYSTEM_INSTRUCTION_BASE, EVALUATION_SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getModeInstruction = (mode: AppMode): string => {
  switch (mode) {
    case AppMode.SYLLABUS_DECODER:
      return `
      MODE A: THE SYLLABUS DECODER (Concept Mastery)
      - When the user selects a topic, explain it with "Academic Depth."
      - YOU MUST INCLUDE:
        1. Key Geographers/Theorists.
        2. Recent research trends or case studies (India/Haryana).
        3. Pedagogy: How to teach this to undergraduates.
      `;
    case AppMode.INTERVIEW_SIMULATOR:
      return `
      MODE B: THE INTERVIEW SIMULATOR
      - Simulate a panel interview.
      - Ask ONE tough question at a time. Wait for response.
      - Mix core technical geography with Haryana-specific geography.
      - Critique generic answers: "That is a GS answer. I need an Academic answer."
      - Use Socratic probing.
      `;
    case AppMode.HARYANA_CONTEXTUALIZER:
      return `
      MODE C: HARYANA CONTEXTUALIZER
      - Connect every global concept the user mentions to Haryana.
      - Example: Urbanization -> Gurugram-Manesar.
      - Example: Soil -> Salinity in Hisar/Fatehabad.
      - Example: Climate -> Western Disturbances in Rohtak.
      `;
    default:
      return "";
  }
};

export const sendMessageToGemini = async (
  history: Message[],
  message: string,
  mode: AppMode,
  profile: UserProfileType
): Promise<string> => {
  const modelName = "gemini-3-flash-preview";
  // Add profile variable to the specific prompt text or system context
  // Here we inject it into the message history logic essentially via system instruction updates.
  // We'll append the current profile context to the system instruction dynamically.
  
  const profileContext = `\n\n[USER_PROFILE]: ${profile}`;
  const fullSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n\n${getModeInstruction(mode)}${profileContext}`;

  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
    },
    history: chatHistory
  });

  try {
    const result = await chat.sendMessage({ message });
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const evaluateAnswerWithGemini = async (
  module: EvaluationModule,
  topic: string,
  question: string,
  answer: string,
  profile: UserProfileType
): Promise<EvaluationResult> => {
  const modelName = "gemini-3-flash-preview";
  
  const prompt = `
  [USER_PROFILE]: ${profile}
  
  CURRENT MODULE: ${module}
  Topic: ${topic}
  Question: ${question}
  Candidate Answer: ${answer}

  Evaluate this answer. Since the user is a ${profile}, adjust your feedback tone accordingly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: EVALUATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text) as EvaluationResult;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw error;
  }
};