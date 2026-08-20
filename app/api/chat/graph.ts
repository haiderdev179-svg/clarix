import { END, GraphNode, START, StateGraph, MemorySaver } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { AIMessage, SystemMessage } from "@langchain/core/messages"
import { getDynamicModel } from "./model";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { productTool, tools } from "./tool";
import { ingestEventToPolar } from "@/lib/polar"
import { waitUntil } from "@vercel/functions";

const llmCall: GraphNode<typeof MessagesState> = async (state, runtime) => {
  
  //todo: receive this model id from frontend
  const selectedModel = runtime.context?.selectedModel;
  const userId = runtime.context?.userId;

  const model = getDynamicModel(selectedModel);

  const modelWithTools = model.bindTools(tools);

  const response = await modelWithTools.invoke([
    new SystemMessage("You are a helpful assistant."),
    ...state.messages,
  ]);

  //todo: emit the event to polar
 console.log(response);

  const usage = response.usage_metadata;

// CHANGED: waitUntil makes this non-blocking (LLM response doesn't wait on Polar);
  // try/catch must live INSIDE the callback since waitUntil doesn't propagate errors outward
  waitUntil(
    (async () => {
      try {
        await ingestEventToPolar({
          userId,
          model: selectedModel,
          inputTokens: usage?.input_tokens || 0,
          outputTokens: usage?.output_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        });
      } catch (err) {
        console.error("Polar usage ingestion failed:", err);
        // TODO: consider a retry queue or dead-letter log here later — not tonight
      }
    })()
  );

  return {
    messages: [response],
  };
};

//adding memory to LLM (this is an inmemory store)
// const checkpointer = new MemorySaver();
const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL!);

//doing this only one time  
// (async ()=> {
//   await checkpointer.setup();
// })();
9
function shouldContinue(state: typeof MessagesState.State) {
  const lastMessage = state.messages.at(-1);

  if (lastMessage && "tool_calls" in lastMessage) {
    const toolCalls = (lastMessage as AIMessage).tool_calls;
    if (toolCalls?.length) {
      return "tools";
    }
  }

  return "__end__"; 
};

//Tool Calling
// const tools = [productTool]
const toolNode = new ToolNode(tools);

//Building Graph 
export const agent = new StateGraph(MessagesState)
.addNode("callLlm", llmCall)
.addNode("tools", toolNode)
.addEdge(START, 'callLlm')
.addConditionalEdges('callLlm', shouldContinue, {
  __end__: END,
  tools: "tools",
}).compile({checkpointer});
