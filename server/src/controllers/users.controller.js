import User from '../models/User.js';

export async function listUsers(req, res){
  const users = await User.find({ _id: { $ne: req.user.id } }).select('_id name email avatar lastSeen').sort({ name: 1 });
  res.json(users);
}
