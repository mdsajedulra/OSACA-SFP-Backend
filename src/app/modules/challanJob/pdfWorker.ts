// workers/pdfWorker.ts

import { generateAllChallansPdf } from "../challan/bulkChallanPdf.service";
import { generationBatchModel } from "./gerationBatch.mode";
import pdfJobModel from "./pdfJob.model";

export function startPdfWorker() {
  // console.log("🔄 PDF Worker চালু");

  setInterval(async () => {
    // pending job আছে কিনা দেখো
    const job = await pdfJobModel.findOneAndUpdate(
      { status: "pending" },
      { status: "processing" },
      { new: true },
    );
    
    console.log("🔄 PDF Worker: pending job found", job);
    if (!job) return; // নেই — চুপ থাকো

    try {
      // PDF বানাও
      const pdfPath = await generateAllChallansPdf(job.batchId.toString());

      // সফল
      await job.updateOne({ status: "ready", pdfPath });
      await generationBatchModel.findByIdAndUpdate(job.batchId, {
        status: "zip_ready",
        zipPath: pdfPath,
        zipGeneratedAt: new Date(),
      });
    } catch (err: any) {
      console.error("❌ PDF generation error:", err.message); // ← এটা যোগ করো
      await job.updateOne({ status: "failed", error: err.message });
      await generationBatchModel.findByIdAndUpdate(job.batchId, {
        status: "failed",
      });
    }
  }, 10000); // ১০ সেকেন্ড
}
