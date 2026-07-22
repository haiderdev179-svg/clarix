import { UIMessage } from "ai";
import React from "react";

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
import { ProductCarousel } from "./gen-ui/product-carousel";

const MessageRenderer = ({ messages }: { messages: UIMessage[] }) => {
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
                  case "text":
                    return (
                      <MessageResponse key={`${message.id}-${i}`}>
                        {part.text}
                      </MessageResponse>
                    );

                  case "dynamic-tool":
                    switch (part.toolName) {
                      case "display_products":
                        if (part.state === "output-available") {
                          const toolContent = JSON.parse(
                            (part.output as any).kwargs.content,
                          );

                          return (
                            <div key={`${part.toolCallId}-${i}`}>
                              <ProductCarousel
                                query={toolContent.query}
                                products={toolContent.products}
                              />
                            </div>
                          );
                        }
                        return null;

                      default:
                        return null;
                    }

                  default:
                    return null;
                }
              })}
            </MessageContent>
          </Message>
        ))
      )}
      <ConversationScrollButton />
    </>
  );
};

export default MessageRenderer;
