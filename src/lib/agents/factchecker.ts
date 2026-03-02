import { getModel } from "../gemini";
import { searchPerplexity } from "../perplexity";

export async function runFactChecker(text: string, clientWebsite: string): Promise<string> {
    const model = getModel();

    // Step 1: Identify claims and generate search queries
    const planPrompt = `
    Analyze the following blog post. Identify key factual claims that need verification.
    Also consider claims specific to the client (website: ${clientWebsite}).
    
    Generate 3-5 targeted search queries to verify these facts.
    Include at least one specific query for the client's website using "site:${clientWebsite}" syntax if there are client-specific claims.
    
    Output JSON format only: ["query1", "query2", ...]
    
    ### Blog Text:
    ${text.substring(0, 5000)} // Limiting verification scope to first 5k chars if huge
  `;

    let queries: string[] = [];
    try {
        const planResult = await model.generateContent(planPrompt);
        const planResponse = planResult.response.text();
        const jsonStr = planResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        queries = JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Failed to generate search plan, falling back to general search.", e);
        queries = [`${clientWebsite} facts`, "blog topic verification"];
    }

    // Step 2: Execute Searches (Parallel via Perplexity)
    const searchResults = await Promise.all(
        queries.map(q => searchPerplexity(q))
    );

    // Flatten results
    const flatResults = searchResults.flat().slice(0, 5); // Keep top 5 to avoid token limits
    const searchContext = flatResults.map((r, i) => `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\nSummary: ${r.description}`).join('\n\n');

    // Step 3: Rewrite/Correct with context
    const editPrompt = `
    You are an expert Fact-Checking Editor for a B2B SaaS blog.
    Review the original text and correct any factual errors based on the provided Perplexity search context.
    
    Client Website constraint: The article must correctly represent ${clientWebsite}.
    
    ### Search Context (Use this as truth!):
    ${searchContext}
    
    ### Guidelines:
    1. If a claim is contradicted by the search context, CORRECT IT smoothly.
    2. If a claim is unsupported but harmless, leave it. If it's a major unsupported claim, soften it.
    3. DO NOT change the style, tone, or structure of the article unnecessarily.
    4. Preserve all HTML formatting exactly as it is.
    5. Return ONLY the edited final text. No preamble, no explanation of changes.
    
    ### Original Text to Check:
    ${text}
  `;

    try {
        const result = await model.generateContent(editPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Fact Checker Editor failed:", error);
        throw error;
    }
}
