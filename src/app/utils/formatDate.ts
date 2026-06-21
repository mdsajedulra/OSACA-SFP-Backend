import { toBanglaNumber } from "./toBanglaNumber";

export function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString();
  return `${toBanglaNumber(+d)}/${toBanglaNumber(+m)}/${toBanglaNumber(+y)}`;
}
