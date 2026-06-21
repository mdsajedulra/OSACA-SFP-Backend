import { Counter } from "../modules/challan/counter.model";


/**
 * একটা block reserve করো — DB কে মাত্র একবার hit করে
 * 5000 নম্বর লাগলেও একটাই $inc call
 */
export async function reserveChallanBlock(count: number): Promise<number> {
  if (count <= 0) throw new Error("count must be > 0");

  const counter = await Counter.findByIdAndUpdate(
    "challanNo",
    { $inc: { seq: count } },
    { new: true, upsert: true }
  );

  // counter.seq = শেষ নম্বর
  // শুরুর নম্বর = শেষ - count + 1
  return counter.seq - count + 1;
}

/**
 * Number কে 6 digit padded string এ convert করো
 * 1    → "000001"
 * 999  → "000999"
 * 4992 → "004992"
 */
export function formatChallanNo(num: number): string {
  if (num > 999999) throw new Error(`Challan number ${num} exceeds 6 digits`);
  return num.toString().padStart(6, "0");
}

/**
 * Current counter দেখো — read only, কিছু বদলায় না
 */
export async function getCurrentChallanSeq(): Promise<number> {
  const counter = await Counter.findById("challanNo");
  return counter?.seq ?? 0;
}