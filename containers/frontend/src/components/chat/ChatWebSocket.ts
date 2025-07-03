import { ChatMessage, MessageType } from '../../types/chat.types';
import { navigate } from '../../utils/router';
import { getWsUrl } from '../../config/api';

export class ChatWebSocket {
  private socket: WebSocket;
  private isIdentified = false;
  private onMessage: (message: ChatMessage) => void;
  private addSystemMessage: (content: string, type: MessageType) => void;

  constructor(onMessage: (message: ChatMessage) => void, addSystemMessage: (content: string, type: MessageType) => void) {
    this.onMessage = onMessage;
    this.addSystemMessage = addSystemMessage;
    this.socket = new WebSocket(getWsUrl(''));
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      this.addSystemMessage('Connected to chat server', MessageType.SYSTEM);
      this.addSystemMessage('Type /help for available commands', MessageType.SYSTEM);

      const username = sessionStorage.getItem('username') || 'Anonymous';
      const userId = sessionStorage.getItem('userId') || Date.now().toString();
      
      this.socket.send(JSON.stringify({
        type: 'identify',
        userId: userId,
        username: username
      }));
      
      this.isIdentified = true;
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'game_invite_accepted') {
          this.addSystemMessage(`${data.username} accepted your game invitation! Starting game...`, MessageType.GAME);
          setTimeout(() => {
            this.startPongGameFromInvite(data.username, data.inviteId);
          }, 2000);
          return;
        }
        
        if (data.type === 'game_invite_declined') {
          this.addSystemMessage(`${data.username} declined your game invitation.`, MessageType.GAME);
          return;
        }
        
        const message: ChatMessage = {
          id: data.id || Date.now().toString(),
          type: data.type as MessageType,
          username: data.username,
          content: data.content,
          timestamp: new Date(data.timestamp),
          channel: data.channel,
          targetUser: data.targetUser,
          inviteId: data.inviteId,
          gameRoomId: data.gameRoomId
        };
        
        if (message.type === MessageType.GAME_INVITE) {
          const currentUser = sessionStorage.getItem('username');
          if (message.targetUser !== currentUser) {
            return;
          }
        }
          
        this.onMessage(message);
      } catch (e) {
        console.error('Error parsing message:', e);
        const message: ChatMessage = {
          id: Date.now().toString(),
          type: MessageType.GENERAL,
          content: event.data.toString(),
          timestamp: new Date()
        };
        this.onMessage(message);
      }
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket closed');
      this.addSystemMessage('Disconnected from chat server', MessageType.SYSTEM);
      this.isIdentified = false;
    });

    this.socket.addEventListener('error', (e) => {
      console.error('WebSocket error', e);
      this.addSystemMessage('Connection error', MessageType.SYSTEM);
      this.isIdentified = false;
    });
  }

  sendMessage(message: any): boolean {
    if (this.socket.readyState !== WebSocket.OPEN || !this.isIdentified) {
      this.addSystemMessage('Not connected to server', MessageType.SYSTEM);
      return false;
    }
    
    this.socket.send(JSON.stringify(message));
    return true;
  }

  sendGameInvitation(targetUser: string) {
    const username = sessionStorage.getItem('username') || 'Anonymous';
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const inviteMessage = {
      type: MessageType.GAME_INVITE,
      username: username,
      targetUser: targetUser,
      content: `${username} wants to challenge you to a Pong match!`,
      inviteId: inviteId,
      timestamp: new Date().toISOString()
    };

    this.sendMessage(inviteMessage);
    this.addSystemMessage(`Game invitation sent to @${targetUser}`, MessageType.GAME);
  }

  acceptGameInvite(inviteId: string, fromUser: string) {
    const username = sessionStorage.getItem('username') || 'Anonymous';
    
    const responseMessage = {
      type: MessageType.GAME_INVITE_RESPONSE,
      username: username,
      targetUser: fromUser,
      content: `${username} accepted the game invitation!`,
      inviteId: inviteId,
      action: 'accept',
      timestamp: new Date().toISOString()
    };
    
    this.sendMessage(responseMessage);
    this.addSystemMessage(`Joining game with ${fromUser}...`, MessageType.GAME);
    
    setTimeout(() => {
      this.startPongGameFromInvite(fromUser, inviteId);
    }, 1000);
  }

  declineGameInvite(inviteId: string, fromUser: string) {
    const username = sessionStorage.getItem('username') || 'Anonymous';
    
    const responseMessage = {
      type: MessageType.GAME_INVITE_RESPONSE,
      username: username,
      targetUser: fromUser,
      content: `${username} declined the game invitation.`,
      inviteId: inviteId,
      action: 'decline',
      timestamp: new Date().toISOString()
    };
    
    this.sendMessage(responseMessage);
    this.addSystemMessage(`Declined game invitation from ${fromUser}`, MessageType.GAME);
  }

  private startPongGameFromInvite(opponent: string, inviteId: string) {
    this.addSystemMessage('Initializing Pong game...', MessageType.GAME);
    navigate(`/pong`);
  }

  isConnected(): boolean {
    return this.socket.readyState === WebSocket.OPEN && this.isIdentified;
  }
}