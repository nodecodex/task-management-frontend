import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../utils/constants';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentBoardId = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected successfully:', this.socket.id);
      if (this.currentBoardId) {
        this.joinBoard(this.currentBoardId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('🔌 Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.currentBoardId) {
      this.leaveBoard(this.currentBoardId);
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId) {
    if (!boardId) return;
    if (this.currentBoardId && this.currentBoardId !== boardId) {
      this.leaveBoard(this.currentBoardId);
    }
    this.currentBoardId = boardId;
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.JOIN_BOARD, boardId);
      console.log(`🔌 Joined board room: board:${boardId}`);
    }
  }

  leaveBoard(boardId) {
    const targetBoard = boardId || this.currentBoardId;
    if (targetBoard && this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_BOARD, targetBoard);
      console.log(`🔌 Left board room: board:${targetBoard}`);
    }
    if (this.currentBoardId === targetBoard) {
      this.currentBoardId = null;
    }
  }

  on(event, callback) {
    if (!this.socket) {
      this.connect(localStorage.getItem('accessToken'));
    }
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
