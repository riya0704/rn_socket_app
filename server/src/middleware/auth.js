import { verifyJwt } from '../utils/jwt.js';
export function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    const payload = verifyJwt(token);
    req.user = { id: payload.id };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
