import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({temperature: 1});

let vectorStore

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

async function loadStory() {
    const loader = new TextLoader("./public/story.txt");
    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 250, chunkOverlap: 50});
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`length:` + splitDocs.length);
    vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    console.log("vector store created")
    await vectorStore.save("vectordatabase");
}

await loadStory()