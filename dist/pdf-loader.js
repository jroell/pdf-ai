import { PDFLoader } from "langchain/document_loaders/fs/pdf";
const loader = new PDFLoader("src/document_loaders/example_data/example.pdf");
const docs = await loader.load();
//# sourceMappingURL=pdf-loader.js.map