import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, index: true },
  password: { type: String, required: true },
  avatar: String,
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
