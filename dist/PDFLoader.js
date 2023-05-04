import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";
const chat = new ChatOpenAI({ temperature: 0 });
const response = await chat.call([
    new HumanChatMessage("Translate this sentence from English to French. I love programming."),
]);
console.log(response);
//# sourceMappingURL=PDFLoader.js.map