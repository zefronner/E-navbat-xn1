import { model, Schema } from 'mongoose';

const doctorSchema = new Schema(
  {
    phoneNumber: { type: String, unique: true },
    fullName: { type: String },
    special: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

doctorSchema.virtual('graphs', {
  ref: 'Graph',
  localField: '_id',
  foreignField: 'doctorId',
});

const Doctor = model('Doctor', doctorSchema);
export default Doctor;
