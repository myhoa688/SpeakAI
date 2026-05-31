import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { transcribeAudioSafely } from '../services/aiService.js';

let io: Server;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('audio_chunk', async (data: { chunk: ArrayBuffer | Buffer | string, index: number }) => {
      try {
        let buffer: Buffer;
        if (typeof data.chunk === 'string') {
          const base64Data = data.chunk.replace(/^data:audio\/\w+;base64,/, '');
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          buffer = Buffer.from(data.chunk as ArrayBuffer);
        }

        const audioFile = {
          buffer,
          originalname: `chunk-${data.index || Date.now()}.webm`,
          mimetype: 'audio/webm'
        };

        const result = await transcribeAudioSafely(audioFile as any);
        
        if (result.transcript) {
          socket.emit('transcript_chunk', {
            transcript: result.transcript,
            index: data.index
          });
        }
      } catch (error) {
        console.error('Socket audio_chunk error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
