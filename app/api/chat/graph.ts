import { END, GraphNode, START, StateGraph, MemorySaver } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { AIMessage, SystemMessage } from "@langchain/core/messages"
import { getDynamicModel } from "./model";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { productTool, tools } from "./tool";

const llmCall: GraphNode<typeof MessagesState> = async (state) => {
  
  //todo: receive this model id from frontend
  const model = getDynamicModel("gpt-5-nano");

  const modelWithTools = model.bindTools(tools);

  const response = await modelWithTools.invoke([
    new SystemMessage("You are a helpful assistant."),
    ...state.messages,
  ]);
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
const tools = [productTool]
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
