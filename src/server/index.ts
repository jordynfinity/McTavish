/**
 * McTavish Server
 * 
 * Express server that interfaces with the McTavish runtime core:
 * - Provides REST API endpoints for fractures, characters, responses, and premonitions
 * - Implements real-time updates via Socket.IO
 * - Connects frontend applications to the McTavish ecosystem
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import { McTavish } from '../index';

const mctavish = new McTavish();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/fractures', require('./routes/fractures.js')(mctavish));
app.use('/api/characters', require('./routes/characters.js')(mctavish));
app.use('/api/responses', require('./routes/responses.js')(mctavish));
app.use('/api/premonitions', require('./routes/premonitions.js')(mctavish));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('fracture:create', (data) => {
    const { content, source = 'user' } = data;
    mctavish.introduceFracture(content, source);
  });
  
  socket.on('response:select', (data) => {
    const { foldId } = data;
    mctavish.selectResponse(foldId);
  });
});

const collapseEngine = mctavish.getCollapseEngine();
const premonitionMatcher = mctavish.getPremonitionMatcher();
const interactionBinding = mctavish.getInteractionBinding();

collapseEngine.on('recursionFold', (fold) => {
  io.emit('response:created', fold);
});

collapseEngine.on('premonition', (premonition) => {
  io.emit('premonition:created', premonition);
});

premonitionMatcher.on('binding', (binding) => {
  io.emit('premonition:bound', binding);
});

interactionBinding.on('interaction', (interaction) => {
  io.emit('interaction', interaction);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`McTavish server running on port ${PORT}`);
});

export { app, server, mctavish };
