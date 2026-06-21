"use strict";
// workers/pdfWorker.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPdfWorker = startPdfWorker;
const bulkChallanPdf_service_1 = require("../challan/bulkChallanPdf.service");
const gerationBatch_mode_1 = require("./gerationBatch.mode");
const pdfJob_model_1 = __importDefault(require("./pdfJob.model"));
function startPdfWorker() {
    console.log("🔄 PDF Worker চালু");
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        // pending job আছে কিনা দেখো
        const job = yield pdfJob_model_1.default.findOneAndUpdate({ status: "pending" }, { status: "processing" }, { new: true });
        console.log("🔄 PDF Worker: pending job found", job);
        if (!job)
            return; // নেই — চুপ থাকো
        try {
            // PDF বানাও
            const pdfPath = yield (0, bulkChallanPdf_service_1.generateAllChallansPdf)(job.batchId.toString());
            // সফল
            yield job.updateOne({ status: "ready", pdfPath });
            yield gerationBatch_mode_1.generationBatchModel.findByIdAndUpdate(job.batchId, {
                status: "zip_ready",
                zipPath: pdfPath,
                zipGeneratedAt: new Date(),
            });
        }
        catch (err) {
            console.error("❌ PDF generation error:", err.message); // ← এটা যোগ করো
            yield job.updateOne({ status: "failed", error: err.message });
            yield gerationBatch_mode_1.generationBatchModel.findByIdAndUpdate(job.batchId, {
                status: "failed",
            });
        }
    }), 10000); // ১০ সেকেন্ড
}
