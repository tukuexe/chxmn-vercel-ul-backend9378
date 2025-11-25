// Vercel cron hits /api/ping every 5 min (vercel.json)
export default async (req, res) => {
  res.status(200).send('pong');
};
