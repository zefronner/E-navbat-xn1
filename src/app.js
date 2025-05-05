import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './db/index.js';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/admin.routes.js';
import doctorRouter from './routes/doctor.routes.js';
import graphRouter from './routes/graph.routes.js';
import patientRouter from './routes/patient.routes.js';
import appRouter from './routes/appointment.routes.js';
import logger from './utils/logger/logger.js';
config();

process.on('uncaughtException', (err) => {
  console.log(`Uncaught exception: ${err}`);
  process.exit(1);
});

process.on('unhandledRejection', (reasion, promise) => {
  console.log(`Unhandled rejection: ${reasion}`);
});

const PORT = +process.env.PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());

await connectDB();

app.use('/admin', adminRouter);
app.use('/doctor', doctorRouter);
app.use('/graph', graphRouter);
app.use('/patient', patientRouter);
app.use('/appointment', appRouter);

app.use((err, req, res, next) => {
  if (err) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: err });
  } else {
    return next();
  }
});

app.listen(PORT, logger.info(`Server running on port ${PORT}`));
