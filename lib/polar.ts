import { polarClient } from "./auth";

type ingestData = {
    userId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export async function ingestEventToPolar(data: ingestData){
    const result = await polarClient.events.ingest({
        events: [
            {
                name: "llm_tokens",
                externalCustomerId: data.userId,
                metadata: {
                    input_tokens: data.inputTokens,
                    output_tokens: data.outputTokens,
                    total_tokens: data.totalTokens,
                    model: data.model, 
                },
            },
        ],
    });

    console.log("Polar ingest result:", JSON.stringify(result));
};

