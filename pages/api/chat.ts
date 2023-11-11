import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

const threhold :number = 0.84;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {question, history } = req.body;
  const defaultPrompt = '你是一名商场的导购，擅长用生动简洁的语言给用户推荐目的地。\n'+
   '店铺信息里将包含JSON格式，里面的条目代表店铺的详细信息。\n ' + 
   '其中name的值代表<店铺名称>，avgPrice的值代表<人均消费>，recommend的值代表该店铺的<推荐菜列表>，address的值代表店铺的<详细地址>，' + 
   'tel的值代表<店铺电话>，comment的值代表<用户评价>,stars的值代表<用户评级> \n' +
  ' 你必须以JSON回复，格式为: {{ "response": "回复内容", "poi": "推荐的地点列表", "action": "动作" }}。\n' +
  ' 1.action规则：action只能在[nav_one_position, nav_route, None]中选择,不能对其中的选项做任何修改。\n' + 
     '不要询问用户，你应该从用户的对话里判断用户的意图。如果用户想去某个地点则意图是导航。action返回nav_one_position.\n ' + 
     '如果用户想让你介绍附近的地点则意图是导游,action返回nav_route。当用户意图不是导航或者导游时，action返回None\n' +
  ' 2.poi规则：你应该首先从用户对话里判断出用户要去的<目的地>， 你必须从<店铺名称>，<用户评价>和<推荐菜列表>中找到包含<目的地>的关键字以后，在poi里的值里返回<店铺名称>。response里回复推荐理由。 \n ' + 
   '你应该优先查找<店铺名称>，然后查找<推荐菜列表>，最后查找<用户评价>, 如果poi里只返回一个<店铺名称>时，action应该返回nav_one_position \n\n' + 
  ' 3.response规则：response为你对用户的回复\n'
  ' 当你在店铺信息里找不到符合要求的店铺名，请将action返回null，poi返回None,并在response里回复说你找不到相应的店铺信息，并表达歉意\n'
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
  var sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  const search_tip = "(汇智国际商业中心店)";

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

    const docs = await vectorStore.similaritySearchWithScore(sanitizedQuestion,1);
    const scores: number = docs[0][1];

    

    console.log('scores = ' + scores); // 输出第一个元素中的 number 属性 
    console.log('threhold = ' + threhold); // 输出第一个元素中的 number 属性 

    var ref = 0;
    if (scores > threhold) {
      sanitizedQuestion = sanitizedQuestion + search_tip;
      ref = 1;
    }
    console.log('found = ' + ref);

    //create chain
    const chain = makeChain(vectorStore, prompt, ref);

    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0) {
        return new HumanMessage(message);
      } else {
        return new AIMessage(message);
      }
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
