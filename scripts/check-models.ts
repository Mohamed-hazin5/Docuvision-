import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load .env.local manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Error loading .env.local", e);
}

async function main() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found!");
        return;
    }

    console.log("Using API Key starting with:", apiKey.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-pro-vision",
        "gemini-flash-latest",
        "gemini-pro-latest"
    ];

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent("Hello");
            console.log("SUCCESS ✅");
            return; // Found one!
        } catch (error: any) {
            console.log("FAILED ❌");
            // console.log(error.message); // Uncommon to show full error to avoid noise
        }
    }
    console.log("All candidates failed.");
}

main();
