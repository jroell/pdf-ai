#! /usr/bin/env node

import {Command} from "commander";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const program = new Command();

console.log(figlet.textSync("Dir Manager"));

program
	.version("1.0.0")
	.description("Simple CLI wrapper around Langchain/OpenAI APIs")
	.option("-l, --ls  <filepath>", "Load a document from a file path")
	.parse(process.argv);

const options = program.opts();

async function load(filepath: string) {
	try {
		const docs = await new PDFLoader(filepath).load();
		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 4000,
			chunkOverlap: 200,
		});
		const chuncks = await splitter.splitDocuments(docs);
		console.log(chuncks);
	} catch (error) {
		console.error("Error occurred while reading the directory!", error);
	}
}

function createDir(filepath: string) {
	if (!fs.existsSync(filepath)) {
		fs.mkdirSync(filepath);
		console.log("The directory has been created successfully");
	}
}

function createFile(filepath: string) {
	fs.openSync(filepath, "w");
	console.log("An empty file has been created");
}

if (options.ls) {
	const filepath = typeof options.ls === "string" ? options.ls : __dirname;
	load(filepath);
}
if (options.mkdir) {
	createDir(path.resolve(__dirname, options.mkdir));
}
if (options.touch) {
	createFile(path.resolve(__dirname, options.touch));
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
