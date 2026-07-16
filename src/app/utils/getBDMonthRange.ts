export const getBdMonthRange = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, -6, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, -6, 0, 0, 0) - 1);
  return { start, end };
};