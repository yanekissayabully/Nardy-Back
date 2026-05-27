import { Server, Socket } from 'socket.io';

interface Room {
  id: string;
  players: { white?: string; black?: string };
  gameState?: any;
  currentTurn: 'white' | 'black';
  isStarted: boolean;
}

const rooms = new Map<string, Room>();

export function setupMultiplayer(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Создать комнату
    socket.on('create-room', async (callback) => {
      const roomId = generateRoomId();
      rooms.set(roomId, {
        id: roomId,
        players: {},
        currentTurn: 'white',
        isStarted: false,
      });
      socket.join(roomId);
      rooms.get(roomId)!.players.white = socket.id;
      
      console.log(`Room created: ${roomId} by ${socket.id}`);
      callback({ roomId });
    });

    // Присоединиться к комнате
    socket.on('join-room', ({ roomId, asColor }: { roomId: string; asColor?: 'white' | 'black' }, callback) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        return callback({ error: 'Room not found' });
      }
      
      if (room.isStarted) {
        return callback({ error: 'Game already started' });
      }
      
      let assignedColor: 'white' | 'black';
      
      if (asColor && !room.players[asColor]) {
        assignedColor = asColor;
        room.players[assignedColor] = socket.id;
      } else if (!room.players.white) {
        assignedColor = 'white';
        room.players.white = socket.id;
      } else if (!room.players.black) {
        assignedColor = 'black';
        room.players.black = socket.id;
      } else {
        return callback({ error: 'Room is full' });
      }
      
      socket.join(roomId);
      
      // Если оба игрока есть — начинаем игру
      if (room.players.white && room.players.black) {
        room.isStarted = true;
        
        // Отправляем стартовое состояние
        io.to(roomId).emit('game-start', {
          whiteId: room.players.white,
          blackId: room.players.black,
          currentTurn: 'white',
        });
      }
      
      callback({ color: assignedColor });
    });
    
    // Ход в мультиплеере
    socket.on('move', ({ roomId, move, gameState }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      
      // Сохраняем состояние игры
      room.gameState = gameState;
      
      // Меняем терн
      room.currentTurn = room.currentTurn === 'white' ? 'black' : 'white';
      
      // Отправляем ход всем в комнате
      socket.to(roomId).emit('opponent-move', {
        move,
        gameState: room.gameState,
        currentTurn: room.currentTurn,
      });
    });
    
    // Сдаться
    socket.on('resign', ({ roomId }) => {
      io.to(roomId).emit('game-over', { winner: 'opponent' });
      rooms.delete(roomId);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Удаляем пользователя из всех комнат
      for (const [roomId, room] of rooms.entries()) {
        if (room.players.white === socket.id || room.players.black === socket.id) {
          io.to(roomId).emit('opponent-disconnected');
          rooms.delete(roomId);
          break;
        }
      }
    });
  });
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}