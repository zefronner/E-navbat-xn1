import { model, Schema } from 'mongoose';

const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  },
  { timestamps: true }
);

const Admin = model('Admin', adminSchema);
export default Admin;
