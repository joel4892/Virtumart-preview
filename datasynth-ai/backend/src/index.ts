import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { prisma } from './config/prisma';
import { authRouter } from './routes/auth';
import { datasetsRouter } from './routes/datasets';
import { annotationsRouter } from './routes/annotations';
import { complianceRouter } from './routes/compliance';
import { exportRouter } from './routes/export';
import { projectsRouter } from './routes/projects';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/error';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static serving for local storage downloads
app.use('/static', express.static(path.join(process.cwd(), 'storage')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/projects', projectsRouter);
app.use('/datasets', datasetsRouter);
app.use('/annotations', annotationsRouter);
app.use('/compliance', complianceRouter);
app.use('/export', exportRouter);
app.use('/admin', adminRouter);

app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

void start();