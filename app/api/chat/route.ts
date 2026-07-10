import { HumanMessage } from "@langchain/core/messages";
import { agent } from "./graph";

export async function POST(request: Request) {

  const data = await request.json()

  // console.log({data});

  const result = await agent.invoke({
    messages: [new HumanMessage(data.messageContent)],
  });

  for (const message of result.messages) {
    console.log(`[${message.type}]: ${message.text}`);
  }

  return Response.json({ message: "ok" });
};