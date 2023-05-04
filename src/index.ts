#! /usr/bin/env node

import {Command} from "commander";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {Document} from "langchain/dist/document";

const program = new Command();

console.log(figlet.textSync("PDF-AI-CLI"));

program
	.version("1.0.0")
	.description("Simple CLI wrapper around Langchain/OpenAI APIs")
	.option("-l, --ls  <filepath>", "Load a document from a file path")
	.parse(process.argv);

const options = program.opts();

async function load(filepath: string) {
	try {
		const outputFilePath = path.join(path.dirname(process.cwd()), `${path.basename(filepath)}-chunks.json`);
		// caching layer - check if outputDir exists from previous run
		let chunks: Document<Record<string, any>>[] = [];
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
	} catch (error) {
		console.error("Error occurred while reading the directory!", error);
	}
}

if (options.ls) {
	const filepath = typeof options.ls === "string" ? options.ls : __dirname;
	const chunks = load(filepath);
	console.log(chunks);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
