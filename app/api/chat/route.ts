import { HumanMessage } from "@langchain/core/messages";
import { agent } from "./graph";
import { thread } from "@/db/schema/chat-schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUIMessageStreamResponse } from "ai";
import { toUIMessageStream } from "@ai-sdk/langchain";

export async function POST(request: Request) {

  const {threadId, messageContent} = await request.json();

  //Getting user id (from better-auth using loggedIn user session) for matching with the threadId
  const authData = await auth.api.getSession({headers: await headers()});

  //(checking if the userid doesn't exists)
  if(!authData?.user.id){ 
    return new Response("Forbidden: You don't have access to this response☹️", {status: 403})
  };


  //todo: check if thread exists if not create a new one

  //here we are checking if the thread.id from schema/database is equal to the threadId that we are getting from the user/frontend
  const threadsFromDB = await db.select().from(thread).where(eq(thread.id, threadId)).limit(1); 

  //Getting threadId if we are receiving any from threadsFromDB
  const existingThread = threadsFromDB[0]; //it returns undefined it the array is empty


  //if the thread exists
  if(!existingThread){
      //setting the title of thread
      const title = messageContent.trim().slice(0, 20) || "New Conversation" //if anything appears in the thread we are selecting first 20characters as title

      //inserting this to database
      await db.insert(thread).values({
        id: threadId,
        title: title,
        userId: authData.user.id,
      });
  };

  //checking if the thread is from the same user
  if (existingThread && existingThread?.userId !== authData.user.id) {
    return new Response("Forbidden: You don't have access to this response☹️", { status: 403 })
  };


  //Invoking the LLM/Agent
  const stream = await agent.streamEvents({
    messages: [new HumanMessage(messageContent)],
  }, {
    version: 'v2',  
    configurable: {
      thread_id: threadId,
    }
  });

  // for (const message of result.messages) {
  //   console.log(`[${message.type}]: ${message.text}`);
  // }

 
 
  //using createUIMessageStreamResponse "adapter" for connect ai-sdk (frontend) with langchain/langgraph (backend)
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream)//toUIMessagestream adapter needed for chatUI() for streaming response
  })
};