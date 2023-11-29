import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from "langchain/memory";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { createRetrieverTool } from "langchain/agents/toolkits";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { Document } from "langchain/document";


const QA_PROMPT = `
商铺的详细介绍：{context}

我的问题：{question}

Helpful answer in chinese `;


const template = `
'你现在将扮演一个智能AR虚拟人，擅长针对我的询问用生动简洁的语言给我推荐或者介绍附近的商铺，并给我导航带路。注意：我不仅会问问题，还会给你下达指令，比如给我带路。'+
  ' 你必须以JSON回复，格式为: {{ "response": "回复内容", "poi": "推荐的地点列表", "action": "动作"，"question":"问题" }}。' +
  ' action只能在[nav_one_position, nav_route, None]中选择,不能对其中的选项做任何修改。' + 
  ' 不要询问，你需要根据我的问题识别出他的意图，并将其分类为： ' +
   ' 1. 介绍 : 当我询问你附近的地点的时候，他希望你列举出最符合描述的店铺名称，你应该在poi里返回两到三个名称的列表. ' +
   '并在action里返回nav_route, response里返回简短的介绍, question返回我的问题所有原文' + 
   '当你在所有商铺名称列表里找不到符合要求的店铺名，请将action返回null，poi返回None,并在response里回复说你找不到相应的店铺信息，并表达歉意'+
   ' 2.导航:  当我希望你带领他去某个地点的时候，你应该在poi里返回最符合他要求的一个商铺名称, ' + 
  '并在action里返回nav_one_position, response里返回简短的介绍,并让我跟随你，question返回我的问题所有原文' +
   ' 3. 其他: 当我的意图不是介绍或者导航的时候，你应该在你的知识范围内尽量回答他, poi返回null, 并在action里返回None, response里返回简短的介绍，question返回我的问题所有原文'+
   '你只能在所有商铺名称列表中选择地点推荐和介绍给我， 所有店铺名称在上海汇智国际商业中心商铺列表中展示并用<>包围'
以下是可以用来参考的上下文，包含了商铺的详细介绍：{context}
Helpful answer in chinese
  `;

const new_prompt = new PromptTemplate({
  template,
  inputVariables: ["question", "context"],
});

const serializeDocs = (docs: Array<Document>): string =>
  docs.map((doc) => doc.pageContent).join("\n");

export const makeChain = (vectorstore: PineconeStore, prompt: string) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo-16k', //change this to gpt-4 if you have access
  });

  const questionPrompt = PromptTemplate.fromTemplate(prompt + QA_PROMPT);

  const chain = RunnableSequence.from([
    {
      question: (input: { question: string; chatHistory?: string }) =>
        input.question,
      chatHistory: (input: { question: string; chatHistory?: string }) =>
        input.chatHistory ?? "",
      context: async (input: { question: string; chatHistory?: string }) => {
        const relevantDocs = await vectorstore.asRetriever(4).getRelevantDocuments(input.question);
        const serialized = serializeDocs(relevantDocs);
        console.log("context =" + serialized);
        return serialized;
      },
    },
    questionPrompt,
    model,
    new StringOutputParser(),
  ]);

  return chain;
};
