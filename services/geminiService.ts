import { GoogleGenAI } from "@google/genai";

// Creates a new GoogleGenAI instance.
// This function is called before each API request to ensure the client uses the latest,
// securely provided API key from the environment.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error is a safeguard but should not be hit in a configured environment
    // where the user is prompted to select a key.
    throw new Error("Chiave API di Gemini non trovata. Assicurati che sia configurata nel tuo ambiente per usare l'applicazione.");
  }
  return new GoogleGenAI({ apiKey });
};


export async function processTranscript(text: string): Promise<{ improvedText: string; summary: string }> {
  const ai = getAiClient();
  try {
    // 1. Improve the text
    const improveResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Migliora il seguente testo. Correggi la grammatica, la punteggiatura e ricostruisci le frasi per renderlo scorrevole e coerente, preservando il significato originale. Fornisci solo il testo corretto senza aggiungere introduzioni o commenti.\n\n---\n\n${text}`,
    });
    const improvedText = improveResponse.text;

    if (!improvedText) {
        throw new Error("Il miglioramento del testo è fallito o non ha restituito risultati.");
    }

    // 2. Summarize the improved Italian text
    const summarizeResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Crea un riassunto molto breve e sintetico del seguente testo in italiano, evidenziando solo i punti chiave principali:\n\n---\n\n${improvedText}`,
    });
    const summary = summarizeResponse.text;

    if (!summary) {
        throw new Error("La creazione del riassunto è fallita o non ha restituito risultati.");
    }
    
    return { improvedText, summary };
  } catch (error) {
    console.error("Errore con l'API Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Errore durante l'elaborazione del testo con l'API Gemini: ${error.message}`);
    }
    throw new Error("Si è verificato un errore sconosciuto durante l'elaborazione del testo con l'API Gemini.");
  }
}

export async function translateToItalian(text: string): Promise<string> {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Traduci il seguente testo in italiano. Se il testo è già in italiano, restituiscilo senza modifiche. Fornisci solo il testo tradotto/originale senza aggiungere introduzioni o commenti.\n\n---\n\n${text}`,
    });
    const translatedText = response.text;
    if (!translatedText) {
      throw new Error("La traduzione è fallita o non ha restituito risultati.");
    }
    return translatedText;
  } catch (error) {
    console.error("Errore durante la traduzione con l'API Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Errore durante la traduzione con l'API Gemini: ${error.message}`);
    }
    throw new Error("Si è verificato un errore sconosciuto durante la traduzione con l'API Gemini.");
  }
}