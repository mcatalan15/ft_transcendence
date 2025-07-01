export enum MessageType {
  GENERAL = 'general',
  PRIVATE = 'private',
  SERVER = 'server',
  SYSTEM = 'system',
  FRIEND = 'friend',
  GAME = 'game',
  GAME_INVITE = 'game_invite',
  GAME_INVITE_RESPONSE = 'game_invite_response'
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  username?: string;
  content: string;
  timestamp: Date;
  channel?: string;
  targetUser?: string;
  inviteId?: string;
  gameRoomId?: string;  
}