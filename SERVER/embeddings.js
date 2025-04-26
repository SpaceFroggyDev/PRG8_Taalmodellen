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

async function askQuestion(prompt){
    const relevantDocs = await vectorStore.similaritySearch(prompt, 3)
    console.log(relevantDocs[0].pageContent)
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
    console.log(context)
    // chat
    const response = await model.invoke([
        ["system","You are an adventurer in medieval times on a long journey with friends, talking to your travel companion. Your name is Jerry and you are a tiefling bard who sings about the adventures you and your party experienced. you talk like you are from medieval times as well but on a level that is understandable for someone who speaks modern english. " +
        "You will get a context and a question. use only the context to answer the question while answering in a way that fits your personality as Jerry."],
        ["user",`the context is ${context}, the question is ${prompt}`]

    ])
    console.log("---")
    console.log(response.content)
}

await loadStory()
//await askQuestion("who is the hero of this story?")