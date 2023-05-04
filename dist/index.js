#! /usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
let storeClient;
const program = new Command();
console.log(figlet.textSync("PDF-AI-CLI"));
program
    .version("1.0.0")
    .description("Simple CLI wrapper around Langchain/OpenAI APIs")
    .option("-l, --ls  <filepath>", "Load a document from a file path")
    .parse(process.argv);
const options = program.opts();
async function load(filepath) {
    try {
        const outputFilePath = path.join(path.dirname(process.cwd()), `${path.basename(filepath)}-chunks.json`);
        // caching layer - check if outputDir exists from previous run
        let chunks = [];
        if (fs.existsSync(outputFilePath)) {
            console.log("...using cached chunks via: ", outputFilePath);
            const cachedFile = fs.readFileSync(outputFilePath);
            // convert file to string
            chunks = JSON.parse(cachedFile.toString());
            return chunks;
        }
        // load document since no cache exists
        const docs = await new PDFLoader(filepath).load();
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 4000,
            chunkOverlap: 200,
        });
        chunks = await splitter.splitDocuments(docs);
        fs.writeFileSync(outputFilePath, JSON.stringify(chunks));
        return chunks;
    }
    catch (error) {
        console.error("Error occurred while reading the directory!", error);
    }
}
async function getStore(chunks, searchTerm, k = 1) {
    const privateKey = process.env.SUPABASE_PRIVATE_KEY;
    if (!privateKey)
        throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);
    const url = process.env.SUPABASE_URL;
    if (!url)
        throw new Error(`Expected env var SUPABASE_URL`);
    const client = createClient(url, privateKey);
    const vectorStore = await SupabaseVectorStore.fromDocuments(chunks, new OpenAIEmbeddings(), {
        client,
        tableName: "documents",
        queryName: "match_documents",
    });
    const resultOne = await vectorStore.similaritySearch(searchTerm, k);
    console.log(resultOne);
}
if (options.ls) {
    try {
        const filepath = typeof options.ls === "string" ? options.ls : __dirname;
        const chunks = await load(filepath);
        if (!chunks)
            throw new Error(`Expected chunks to be defined`);
        getStore(chunks, "what is a custom property?");
    }
    catch (error) {
        console.log("Something bad happened :( .... ->", error);
    }
}
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map