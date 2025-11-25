const cache = new Map();
const TTL = 10_000; // 10 s

export const get = (key, fetcher) => {
  if (cache.has(key) && Date.now() - cache.get(key).t < TTL)
    return Promise.resolve(cache.get(key).v);
  // stale-while-revalidate
  if (cache.has(key)) fetcher(key).then(v => cache.set(key, { v, t: Date.now() })).catch(() => {});
  return fetcher(key).then(v => (cache.set(key, { v, t: Date.now() }), v));
};
