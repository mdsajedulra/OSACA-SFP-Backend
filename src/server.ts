import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { startPdfWorker } from "./app/modules/challanJob/pdfWorker";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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
