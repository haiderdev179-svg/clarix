"use server"

import { headers } from "next/headers";
import { auth, polarClient } from "./auth";

type ingestData = {
    userId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
};


export async function isUserHaveSubscription(){
    try {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    return false;
  }

  const data = await polarClient.subscriptions.list({
    externalCustomerId: session.user.id,
    active: true,
  });

  return data.result.items.length > 0

} catch (error) {
  console.log("erx", error);
  return false;
}
}


export async function getCustomMeters(){

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        throw new Error("User is not authenticated");
    };

    const meters = await polarClient.customerMeters.list({
        externalCustomerId: session.user.id,
    });

    // console.log(meters.result.items);
    return meters.result.items[0];
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

