import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";

import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";

export const run = async (cleanDB: boolean, summarize: boolean) => {
  try {
    /*load raw docs from the all files in the directory */
    
    const url = "https://help.easyar.cn/EasyAR%20Mega/Questions/FAQ.html";

    const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;
    
    const loader = new RecursiveUrlLoader(url, {
      extractor: compiledConvert,
      maxDepth: 1,
      excludeDirs: [""],
    });
    
    debugger
    const docs = await loader.load();
    console.log('docs = ' + docs);

    await processDocs(docs, cleanDB, summarize);

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};


const processDocs = async (rawDocs: Document<Record<string, any>>[], cleanDB: boolean, summarize: boolean) => {
  try {

    console.log('cleanDB = ', cleanDB);
    console.log('summarize = ', summarize);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    // console.log('rawDocs', rawDocs);

    console.log('text splittering...');
    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    if (summarize) {
      const model = new OpenAI({ modelName: 'gpt-3.5-turbo-16k', temperature: 0 });
      // This convenience function creates a document chain prompted to summarize a set of documents.
      const chain = loadSummarizationChain(model, {
        type: "map_reduce",
        returnIntermediateSteps: true,
      });
      /* Split text into chunks */
      const textSplitterSummary = new RecursiveCharacterTextSplitter({
        chunkSize: 8000
      });
      const summary_docs = await textSplitterSummary.splitDocuments(rawDocs);
      const res = await chain.call({
        input_documents: summary_docs,
      });

      const summary_content = "The summary of the document(file) is: " + res.text as string;
      console.log(summary_content);
      const summary = new Document({ pageContent: summary_content });
      docs.push(summary);
    }

    console.log("check status of vector DB...")
    const checkStatus = async () => {
      const { status } = await pinecone.describeIndex({
        indexName: PINECONE_INDEX_NAME,
      })
      if (status?.ready) {
        return status
      } else {
        return new Promise((resolve) => {
          setTimeout(() => resolve(checkStatus()), 1000)
        })
      }
    }

    await checkStatus();
    console.log("check status of vector DB done!")

    if (cleanDB) {
      console.log('deleting old vector index...')
      // Delete all vectors in namespace
      await index.delete1({
        deleteAll: true,
        namespace: PINECONE_NAME_SPACE
      });
    }



    console.log("updating vector store...");


    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    console.log('process complete');

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
}

(async () => {
  await run(false, false);
  console.log('ingestion complete');
})();
