import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = ` 给定以下对话和后续对话，将后续输入重新表述为独立问题或者指令。
    对话历史:
    {chat_history}
    后续输入: {question}
    独立问题或者指令:`;

const QA_PROMPT = `
店铺详细介绍：{context}

Helpful answer in chinese`;

export const makeChain = (vectorstore: PineconeStore, prompt: String) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo-16k', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(4),
    {
      qaTemplate: prompt + QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
      
    },
  );
  return chain;
};
