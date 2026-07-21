import { UIMessage } from 'ai';
import React from 'react'

import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { MessageSquare } from "lucide-react";


const MessageRenderer = ({messages}: {messages: UIMessage[]}) => {
  return (
        <>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text": // we don't use any reasoning or tool calls in this example
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                         default:  
                          return "Tool result goes here"
                    }
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        <ConversationScrollButton />
      </>
  );
}

export default MessageRenderer;