"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocx = void 0;
const docx_1 = require("docx");
const generateDocx = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = data.map((d) => new docx_1.TableRow({
        children: [
            new docx_1.TableCell({ children: [new docx_1.Paragraph(d.date.toString())] }),
            new docx_1.TableCell({ children: [new docx_1.Paragraph(d.days.toString())] }),
        ],
    }));
    const doc = new docx_1.Document({
        sections: [
            {
                children: [
                    new docx_1.Paragraph("Monthly Food Report"),
                    new docx_1.Table({ rows }),
                ],
            },
        ],
    });
    return yield docx_1.Packer.toBuffer(doc);
});
exports.generateDocx = generateDocx;
