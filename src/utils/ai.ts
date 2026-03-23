import type { AnalysisResult, AnalysisType } from '../types';

export async function analyzeDecision(
  decision: string, 
  apiKey: string, 
  analysisType: AnalysisType
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in Settings.");
  }

  let promptBuilder = `You are an expert decision-making assistant.
A user is facing the following decision or dilemma:
"${decision}"\n\n`;

  if (analysisType === 'pros_cons') {
    promptBuilder += `Please provide a simple Pros and Cons list.
CRITICAL INSTRUCTION: If the user is deciding between multiple options, EVERY single item in your list MUST explicitly identify which option it applies to (e.g., "Basketball: Improves cardiovascular fitness.", "Football: Higher risk of concussions.").
Return STRICTLY a valid JSON object matching this schema:
{
  "pros": ["pro 1", "pro 2"],
  "cons": ["con 1", "con 2"]
}`;
  } else if (analysisType === 'comparison') {
    promptBuilder += `Please identify the core options the user is choosing between and provide a comparison table format.
Return STRICTLY a valid JSON object matching this schema:
{
  "options": [
    {
      "name": "Option 1 Name",
      "description": "Short description of the option",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"]
    }
  ]
}`;
  } else if (analysisType === 'swot') {
    promptBuilder += `Please provide a SWOT analysis tailored to the situation.
CRITICAL INSTRUCTION: If the user is deciding between multiple options, EVERY single point MUST explicitly identify which option it applies to (e.g., "Basketball: Easier to coordinate practice times.").
Return STRICTLY a valid JSON object matching this schema:
{
  "swot": {
    "strengths": ["strength 1"],
    "weaknesses": ["weakness 1"],
    "opportunities": ["opportunity 1"],
    "threats": ["threat 1"]
  }
}`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptBuilder }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to fetch response from Gemini.");
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error("Invalid response format received from AI.");
  }

  try {
    const parsedData = JSON.parse(textResponse);
    return { type: analysisType, data: parsedData } as AnalysisResult;
  } catch (error) {
    throw new Error("Failed to parse the AI response as valid JSON.");
  }
}
