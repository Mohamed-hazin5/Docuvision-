import fs from 'fs';
import path from 'path';

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
    const { appWorkflow } = await import("../lib/agents/workflow");

    const testContent = `
    Quarterly Report Q3 2024
    
    The company saw a 15% increase in revenue, reaching $5.2M.
    Operating expenses were $2.1M.
    Net profit margin stands at 22%.
    
    Key highlights:
    - Launched new product line "Alpha"
    - Expanded into European market
    - User base grew by 10,000 active users
  `;

    console.log("--- Starting Workflow Verification ---");
    try {
        const result = await appWorkflow.invoke({ documentContent: testContent });
        console.log("--- Workflow Completed ---");
        console.log("Extracted Data:", JSON.stringify(result.extractedData, null, 2));
        console.log("Visualization Suggestions:", result.visualizationSuggestions);
        console.log("Final Report:", result.finalReport);
    } catch (error) {
        console.error("--- Workflow Failed ---", error);
    }
}

main();
