import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { startPdfWorker } from "./app/modules/challanJob/pdfWorker";

async function server() {
  try {
    await mongoose.connect(config.database_url as string);
    startPdfWorker();

    const port = process.env.PORT || config.port || 3000;

    app.listen(Number(port), () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

server();
