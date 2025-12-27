import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { getKeyManager } from "@/lib/multi-key-manager";

// Helper to get a configured model with a rotated key
const getModel = (temperature: number = 0.7) => {
  const keyManager = getKeyManager();
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    maxOutputTokens: 8192,
    apiKey: keyManager.getNextKey(),
    temperature,
  });
};

// --- Document Content Extracting Agent ---
export const documentExtractingAgent = async (documentContent: string) => {
  const prompt = PromptTemplate.fromTemplate(
    `You are an expert Document Content Extracting Agent.
    Your task is to analyze the provided document content and extract key information, structured data, and main themes.
    Ignore boilerplate text and focus on the substantial content.

    Document Content:
    {content}

    Output the extracted information in a structured JSON extraction format (just the JSON, no markdown).`
  );
  const chain = prompt.pipe(getModel(0.3)).pipe(new StringOutputParser());
  return await chain.invoke({ content: documentContent });
};

// --- Visualization Thinking Agent ---
export const visualizationThinkingAgent = async (extractedData: string) => {
  const prompt = PromptTemplate.fromTemplate(
    `You are an expert Visualization Thinking Agent.
    Based on the provided extracted data, suggest the best ways to visualize this information.
    Propose specific chart types (Bar, Line, Pie, Scatter, etc.) and explain why they are suitable.
    Also, suggest a color palette or style that fits the data context.

    Extracted Data:
    {data}

    Provide your suggestions in a clear, numbered list.`
  );
  const chain = prompt.pipe(getModel(0.5)).pipe(new StringOutputParser());
  return await chain.invoke({ data: extractedData });
};

// --- Content Generating Agent ---
export const contentGeneratingAgent = async (extractedData: string, visualizationSuggestions: string) => {
  const prompt = PromptTemplate.fromTemplate(
    `You are an expert Content Generating Agent.
    Your job is to synthesize a comprehensive report or summary based on the extracted data and the visualization suggestions.
    The report should be engaging, well-structured, and ready for presentation.

    Extracted Data:
    {data}

    Visualization Suggestions:
    {suggestions}

    Write the final report in Markdown format.`
  );
  const chain = prompt.pipe(getModel(0.7)).pipe(new StringOutputParser());
  return await chain.invoke({
    data: extractedData,
    suggestions: visualizationSuggestions
  });
};
