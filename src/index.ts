#! /usr/bin/env node

import {Command} from "commander";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

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
		// check cache
		const outputDir = path.join(path.dirname(filepath), `${path.basename(filepath)}-chunks`);
		console.log(outputDir);
		// check if outputDir exists
		if (fs.existsSync(outputDir)) {
			console.log("...using cached chunks via: ", outputDir);
			const cachedChunks = fs.readdirSync(outputDir);
			console.log(outputDir)
			return;
		}

		// load document since no cache exists
		const docs = await new PDFLoader(filepath).load();
		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 4000,
			chunkOverlap: 200,
		});
		const chuncks = await splitter.splitDocuments(docs);
		console.log(chuncks);
		// write chunks to outputDir for cache
		fs.mkdirSync(outputDir);
	} catch (error) {
		console.error("Error occurred while reading the directory!", error);
	}
}

if (options.ls) {
	const filepath = typeof options.ls === "string" ? options.ls : __dirname;
	load(filepath);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
