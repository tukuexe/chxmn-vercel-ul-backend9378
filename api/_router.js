export default (req) => {
  const [_, seg] = req.url.split('/api/');
  if (!seg) return null;
  const [path, id] = seg.split('/');
  return { path, id, method: req.method };
};
