export const logQueryPerformance = (
  queryName: string,
  start: number
) => {
  const duration = Date.now() - start;

  console.log(`[DB QUERY] ${queryName} - ${duration}ms`);
};