import { END, GraphNode, START, StateGraph, MemorySaver } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { SystemMessage } from "@langchain/core/messages"
import { getDynamicModel } from "./model";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"

const llmCall: GraphNode<typeof MessagesState> = async (state) => {
  
  //todo: receive this model id from frontend
  const model = getDynamicModel("gpt-5-nano");

  const response = await model.invoke([
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

//Building Graph 
export const agent = new StateGraph(MessagesState)
.addNode("callLlm", llmCall)
.addEdge(START, 'callLlm')
.addEdge('callLlm', END)
.compile({checkpointer});
