import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

const threhold :number = 0.88;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {question, history } = req.body;
  const defaultPrompt =    '你现在将扮演一个智能AR虚拟人，擅长针对我的询问用生动简洁的语言给我推荐或者介绍附近的商铺，并给我导航带路。注意：我不仅会问问题，还会给你下达指令，比如给我带路。'+
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
   ;
  
  let {prompt} = req.body;
  console.log('prompt', prompt);
  console.log('question', question);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!prompt) {
    prompt = defaultPrompt;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const search_tip = "（对问题和指令有用的信息可以在上海汇智国际商业中心商铺列表里找到）";

  var sanitizedQuestion = question.trim().replaceAll('\n', ' ') + search_tip;

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    // const docs = await vectorStore.similaritySearchWithScore(sanitizedQuestion,1);
    // const scores: number = docs[0][1];

    

    // console.log('scores = ' + scores); // 输出第一个元素中的 number 属性 
    // console.log('threhold = ' + threhold); // 输出第一个元素中的 number 属性 

    // var ref = 0;
    // if (scores > threhold) {
    //   sanitizedQuestion = sanitizedQuestion;
    //   ref = 1;
    // }
    // console.log('found = ' + ref);

    //create chain
    const chain = makeChain(vectorStore, prompt);

    const pastMessages = history.map((message: string, i: number) => {
      // if (i % 2 === 0) {
        return new HumanMessage(message);
      // } else {
      //   return new AIMessage(message);
      // }
    });

    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
