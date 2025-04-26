import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import express from "express"
import cors from "cors"
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const model = new AzureChatOpenAI({
    temperature: 0.2
})

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0.5,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
})

let vectorStore = await FaissStore.load("./vectordatabase", embeddings);

async function sendPrompt(messages){
    const result = await model.invoke(messages)
    return result.content
}

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;

    res.setHeader("Content-Type", "text/plain");

    const stream = await model.stream(messages);
    for await (const chunk of stream) {
        console.log(chunk.content);
        res.write(chunk.content);
    }
    res.end();
});

app.post("/ask", async (req, res) => {
    const prompt = req.body.prompt;

    try {
        const relevantDocs = await vectorStore.similaritySearch(prompt, 3);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

        const stream = await model.stream([
            ["system", "You are an adventurer in medieval times on a long journey with friends, talking to your fellow party member. Your name is Jerry and you are a tiefling bard who sings about the adventures you and your party experienced. you talk like you are from medieval times as well but on a level that is understandable for someone who speaks modern english. You will get a context and a question. Use only the context to answer the question while also playing the character of Jerry."],
            ["user",`the context is ${context}, the question is ${prompt}`],
        ]);

        res.setHeader("Content-Type", "text/plain");

        for await (const chunk of stream) {
            res.write(chunk.content);
        }
        res.end();
    } catch (error) {
        console.error("Error in /ask endpoint:", error.message);
        res.status(500).send("Failed to process the question.");
    }
});

app.listen(3000, ()=> console.log("server listening on port 3000"))
