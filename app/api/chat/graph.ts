import { END, GraphNode, START, StateGraph, MemorySaver } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { AIMessage, SystemMessage } from "@langchain/core/messages"
import { getDynamicModel } from "./model";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { productTool, tools } from "./tool";
import { ingestEventToPolar } from "@/lib/polar"

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

  // CHANGED: wrapped in try/catch so a Polar failure can't break the chat response
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

function shouldContinue(state: typeof MessagesState.State) {
  const lastMessage = state.messages.at(-1);

  if (lastMessage && "tool_calls" in lastMessage && lastMessage.tool_calls?.length) {
    return "tools";
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
