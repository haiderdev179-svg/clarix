"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, AudioLines, ArrowUp } from "lucide-react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

//uuid
import{ v4 as uuidv4 } from 'uuid';
import { threadId } from "worker_threads";
import { useChatStore } from "@/store/chat-store";

function InputContainer() {

  const { selectedModel } = useChatStore();
 
  const [input, setInput] = useState('');

  //Using useRouter() for redirecting the user to new thread conversation page after enter any word or keyword
  const router = useRouter();  //Note: useRouter() runs on client side

  const params = useParams();
 
  //getting the thread_id of current page 
  const finalThreadUrlId = params.thread_id; //this will return undefined if the user is on home page 

  //generatedId  add to finalThreadId, if not generate a new random uuid
 const [generatedId] = useState(() => uuidv4());

 const finalThreadId = finalThreadUrlId || generatedId;

//getting chatInstance from useChatStore
 const {chatInstance} = useChatStore();

 const { messages, sendMessage } = useChat({
  chat: chatInstance,
 });

return (
  <div className="flex flex-col items-center w-full max-w-200 mx-auto pb-6">
    <PromptInput
      className="w-full bg-[#2f2f2f] rounded-[32px]"
      onSubmit={async (message) => {
        if(!message.text) return;
        try {
          await sendMessage(message, {
            body: {
              threadId: finalThreadId,
              selectedModel: selectedModel,
            }
          });
          setInput("");
          // we are on home page, Redirecting to the new thread id
          if (!finalThreadUrlId) {
            router.push(`/chat/${finalThreadId}`);
          }
        } catch (err) {
          console.error("sendMessage error:", err);
        }
      }}
    >
      <PromptInputBody className="flex items-end w-full">
        <button
          type="button" 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#b4b4b4] hover:bg-[#3f3f3f] transition-colors mb-0.5"
        >
          <Plus size={24} strokeWidth={1.5} />
        </button>

        <div className="flex-1 min-w-0 items-center justify-center w-full h-full">
          <PromptInputTextarea
            onChange={(e) => {
              setInput(e.target.value);
            }} 
            value={input}
            placeholder="Ask anything"
            className="w-full flex items-center justify-center bg-transparent border-none focus:ring-0 focus-visible:ring-0 py-3 text-[18px] text-zinc-100 placeholder:text-[#676767] resize-none min-h-11 max-h-50 leading-tight"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 mb-0.5">
          <SpeechInput
            className="shrink-0  h-10 w-10 bg-transparent text-white"
            onTranscriptionChange={(text) => { }}
            size="icon-lg"
            variant="ghost"
          />

          <button
            type="submit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-[#ececec] transition-all"
          >
            <ArrowUp />
          </button>
        </div>
      </PromptInputBody>
    </PromptInput>
  </div>
);
  }

export default InputContainer;
