import { END, GraphNode, START, StateGraph } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { SystemMessage } from "@langchain/core/messages";
import { llmModel } from "./model";

const llmCall: GraphNode<typeof MessagesState> = async (state) => {
  const response = await llmModel.invoke([
    new SystemMessage("You are a helpful assistant."),
    ...state.messages,
  ]);
  return {
    messages: [response],
  };
};

//Building Graph
export const agent = new StateGraph(MessagesState)
.addNode("callLlm", llmCall)
.addEdge(START, 'callLlm')
.addEdge('callLlm', END)
.compile();
