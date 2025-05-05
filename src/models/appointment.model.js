import { model, Schema } from 'mongoose';

const appoinmentSchema = new Schema(
  {
    patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    complaint: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
    graph_id: { type: Schema.Types.ObjectId, ref: 'Graph' },
  },
  { timestamps: true }
);

const Appointment = model('Appointment', appoinmentSchema);
export default Appointment;
