import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';

export async function register(req, res){
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = signJwt({ id: user._id });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
}

export async function login(req, res){
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signJwt({ id: user._id });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
}
