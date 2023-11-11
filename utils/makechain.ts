import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `{question}`;

const QA_PROMPT = `
店铺信息如下：{context}

Helpful answer in chinese`;

const QA_NONE_PROMPT = `
找不到店铺信息。

Helpful answer in chinese`;

export const makeChain = (vectorstore: PineconeStore, prompt: String, found : number) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo-16k', //change this to gpt-4 if you have access
  });

  var promptQA = found == 0 ?  QA_NONE_PROMPT : QA_PROMPT;

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(6),
    {
      qaTemplate: prompt + promptQA,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: false, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
