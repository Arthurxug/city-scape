require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authMiddleware = require('./middleware/auth');
const agentsRouter = require('./routes/agents');
const tasksRouter = require('./routes/tasks');
const delegateRouter = require('./routes/delegate');
const collaborateRouter = require('./routes/collaborate');
const integrationsRouter = require('./routes/integrations');
const assetsRouter = require('./routes/assets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check (no auth)
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Protected API routes
app.use('/api/agents', authMiddleware, agentsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);
app.use('/api/delegate', authMiddleware, delegateRouter);
app.use('/api/collaborate', authMiddleware, collaborateRouter);
app.use('/api/integrations', authMiddleware, integrationsRouter);
app.use('/api/assets', authMiddleware, assetsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ATC Command Center server running on port ${PORT}`);
});
