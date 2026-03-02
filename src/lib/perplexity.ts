const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export interface SearchResult {
    title: string;
    url: string;
    description: string;
    age?: string;
}

export async function searchPerplexity(query: string): Promise<SearchResult[]> {
    if (!PERPLEXITY_API_KEY) {
        console.warn("PERPLEXITY_API_KEY is not set.");
        return [];
    }

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: "system",
                        content: "You are a research assistant. Provide factual information and cite your sources. Format your response strictly as a JSON array of objects with 'title', 'url', and 'description' keys representing the sources you found and their relevance to the query. Do not include markdown formatting or extra text outside the JSON."
                    },
                    {
                        role: "user",
                        content: `Query: ${query}`
                    }
                ],
                temperature: 0.1, // Keep it deterministic for search
            })
        });

        if (!response.ok) {
            console.error(`Perplexity API failed: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Clean up markdown in case the model returns it despite instructions
        const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const parsedResults = JSON.parse(jsonStr);
            if (Array.isArray(parsedResults)) {
                return parsedResults;
            }
        } catch (e) {
            console.warn("Failed to parse Perplexity JSON response, returning raw content as description", e);
            // Fallback representation if it failed to output pure JSON
            return [{
                title: "Perplexity Research Details",
                url: "perplexity-api",
                description: content
            }];
        }

        return [];

    } catch (error) {
        console.error("Error calling Perplexity API:", error);
        return [];
    }
}
