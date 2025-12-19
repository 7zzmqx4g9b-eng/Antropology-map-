
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CulturalData } from "../types";

export async function fetchCulturalData(countryName: string): Promise<CulturalData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed cultural and geographical profile for ${countryName}. Focus on anthropology, heritage, language (including a phonetic guide for the greeting), traditional outfits, and basic facts like official name and capital.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          country: { type: Type.STRING },
          officialName: { type: Type.STRING, description: "The full official name of the country." },
          capital: { type: Type.STRING, description: "The capital city." },
          geographyFact: { type: Type.STRING, description: "An interesting brief fact about the country's geography or landscape." },
          anthropology: { type: Type.STRING, description: "A brief anthropological history of the people." },
          culture: { type: Type.STRING, description: "Key cultural values and practices." },
          languageName: { type: Type.STRING },
          languageGreeting: { type: Type.STRING, description: "A standard greeting in the local language." },
          phoneticGreeting: { type: Type.STRING, description: "The phonetic pronunciation of the greeting (e.g., [bon-zhoor] for Bonjour)." },
          outfitDescription: { type: Type.STRING, description: "Description of the iconic traditional attire." },
          historicalContext: { type: Type.STRING, description: "Brief historical overview." }
        },
        required: ["country", "officialName", "capital", "geographyFact", "anthropology", "culture", "languageName", "languageGreeting", "phoneticGreeting", "outfitDescription", "historicalContext"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateCulturalAudio(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Zephyr'): Promise<ArrayBuffer> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Refined prompt for TTS to ensure audio is prioritized
  const ttsPrompt = `Speak the following text clearly: ${text}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: ttsPrompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  // Iterate through parts to find the audio data, as recommended for multi-part responses
  let base64Audio: string | undefined;
  
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Audio = part.inlineData.data;
        break;
      }
    }
  }

  if (!base64Audio) {
    console.error("Gemini TTS response structure:", response);
    throw new Error("No audio data generated in the model response parts");
  }

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function decodeAudioBuffer(data: ArrayBuffer, audioCtx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data);
  const numChannels = 1;
  const sampleRate = 24000;
  const frameCount = dataInt16.length / numChannels;
  const buffer = audioCtx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
