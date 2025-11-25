import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import router from './_router.js';
import { hash, compare } from './_crypto.js';
import { save, load } from './_files.js';
import { get } from './_cache.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bsjsiwbei893jJiijHh97ienejshi33jhKbebhswbUjbhJvwosud83jens';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Allow-Methods': 'GET,POST' };

export default async function handler(req, res) {
  // lightning CORS
  if (req.method === 'OPTIONS') return res.writeHead(204, CORS).end();
  res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });

  const route = router(req);
  if (!route) return res.end(JSON.stringify({ error: 'Not Found' }));

  try {
    switch (route.path) {
      case 'health': return res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));

      case 'signup': {
        const { username, password } = JSON.parse(req.body || '{}');
        if (!username || !password) throw new Error('Missing fields');
        const users = await get('users', () => load('user'));
        if (users.find(u => u.username === username)) throw new Error('User exists');
        const user = { id: nanoid(), username, passwordHash: hash(password), createdAt: new Date() };
        users.push(user);
        await save('user', user);
        await save('notify', { text: `🆕 User <b>${username}</b> signed up`, type: 'HTML' });
        return res.end(JSON.stringify({ message: 'User created' }));
      }

      case 'login': {
        const { username, password } = JSON.parse(req.body || '{}');
        const users = await get('users', () => load('user'));
        const user = users.find(u => u.username === username);
        if (!user || !compare(password, user.passwordHash)) throw new Error('Invalid credentials');
        const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
        return res.end(JSON.stringify({ token, username }));
      }

      case 'messages': {
        if (route.method === 'GET') {
          const msgs = await get('msgs', () => load('msg'));
          return res.end(JSON.stringify(msgs.slice(-50)));
        }
        if (route.method === 'POST') {
          const auth = req.headers.authorization?.split(' ')[1];
          if (!auth) throw new Error('No token');
          const { username } = jwt.verify(auth, JWT_SECRET);
          const { content } = JSON.parse(req.body || '{}');
          if (!content) throw new Error('Empty message');
          const msg = { id: nanoid(), username, content, timestamp: new Date() };
          await save('msg', msg);
          return res.end(JSON.stringify({ message: 'Sent' }));
        }
        break;
      }

      case 'users/online': {
        const now = Date.now();
        const sessions = await get('sessions', () => load('session'));
        const active = sessions.filter(s => new Date(s.expiresAt).getTime() > now).length;
        return res.end(JSON.stringify({ count: active }));
      }

      case 'ping': return res.end(JSON.stringify({ pong: Date.now() }));

      default: return res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } catch (e) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: e.message }));
  }
}
