import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";


import { BlobServiceClient } from "@azure/storage-blob";
import * as fs from "node:fs";
import * as path from "node:path";

// import {
//   JSONLoader,
//   JSONLinesLoader,
// } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
// import { UnstructuredHTMLLoader } from "langchain/document_loaders/fs/html";


/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'docs/';
const connectionString: string = process.env['AZURE_CONNECTION_STRING'] || '';
const container: string = process.env['AZURE_CONTAINER'] || '';

export const run = async (cleanDB: boolean, summarize: boolean) => {
  try {
    /*load raw docs from the all files in the directory */
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(container);


    if(!fs.existsSync(filePath))
      fs.mkdirSync(filePath);
    
    const tempDir = fs.mkdtempSync(path.join(filePath, "azureblobfileloader"));

    try {

      for await (const blob of containerClient.listBlobsFlat()) {
        let tmpFilePath = path.join(tempDir, blob.name);
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(container);
        const blobClient = containerClient.getBlobClient(blob.name);
        fs.mkdirSync(path.dirname(tmpFilePath), { recursive: true });
        await blobClient.downloadToFile(tmpFilePath);
      }

      const directoryLoader = new DirectoryLoader(tempDir, {
        '.pdf': (path) => new PDFLoader(path),
        '.docx': (path) => new DocxLoader(path),
        '.txt': (path) => new TextLoader(path),
        '.csv': (path) => new CSVLoader(path)
        // '.html': (path) => new UnstructuredHTMLLoader(path),
      });
      const rawDocs = await directoryLoader.load();
  
      await processDocs(rawDocs, cleanDB, summarize);

    } catch (e) {
      throw new Error(`Failed to download file from Azure Blob Storage container ${container}: ${e}`);
    } finally {
      console.log('removing tmp files from : ', tempDir);
      fs.rmSync(path.dirname(tempDir), { recursive: true, force: true });
    }

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
  await run(true, false);
  console.log('ingestion complete');
})();
