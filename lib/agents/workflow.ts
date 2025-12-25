import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import {
    documentExtractingAgent,
    visualizationThinkingAgent,
    contentGeneratingAgent
} from "./agents";

/**
 * Define the graph state using Annotation for LangChain v0.2+
 */
const AgentState = Annotation.Root({
    documentContent: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => ""
    }),
    extractedData: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => ""
    }),
    visualizationSuggestions: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => ""
    }),
    finalReport: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => ""
    })
});

// Define state type for node functions
type StateType = typeof AgentState.State;

// Node functions
const extractorNode = async (state: StateType) => {
    console.log("[Workflow] Step 1: Extracting content...");
    const result = await documentExtractingAgent(state.documentContent);
    return { extractedData: result };
};

const visualizerNode = async (state: StateType) => {
    console.log("[Workflow] Step 2: Thinking about visualizations...");
    const result = await visualizationThinkingAgent(state.extractedData || "");
    return { visualizationSuggestions: result };
};

const generatorNode = async (state: StateType) => {
    console.log("[Workflow] Step 3: Generating final report...");
    const result = await contentGeneratingAgent(
        state.extractedData || "",
        state.visualizationSuggestions || ""
    );
    return { finalReport: result };
};

/**
 * Configure and compile the graph
 */
const workflow = new StateGraph(AgentState)
    .addNode("extractor", extractorNode)
    .addNode("visualizer", visualizerNode)
    .addNode("generator", generatorNode)
    .addEdge(START, "extractor")
    .addEdge("extractor", "visualizer")
    .addEdge("visualizer", "generator")
    .addEdge("generator", END);

// Compile the graph
export const appWorkflow = workflow.compile();
