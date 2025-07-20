import { ChatMessage, MessageType } from '../../types/chat.types';
import { navigate } from '../../utils/router';
import { getWsUrl } from '../../config/api';
import i18n from '../../i18n';

export class ChatWebSocket {
    private socket: WebSocket;
    private messageCallbacks: ((message: ChatMessage) => void)[] = [];
    private systemMessageCallbacks: ((content: string, type: MessageType) => void)[] = [];

    constructor() {
        this.socket = new WebSocket(getWsUrl(''));
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.socket.addEventListener('open', () => {
            const username = sessionStorage.getItem('username') || 'Anonymous';
            const userId = sessionStorage.getItem('userId') || Date.now().toString();
            
            this.socket.send(JSON.stringify({
                type: 'identify',
                userId: userId,
                username: username
            }));
        });

        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleIncomingMessage(data);
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        });

        this.socket.addEventListener('close', () => {
            this.notifySystemMessage(i18n.t('serverDisconnection', { ns: 'chat' }), MessageType.SYSTEM);
        });

        this.socket.addEventListener('error', (e) => {
            console.error('WebSocket error', e);
            this.notifySystemMessage(i18n.t('connectionError', { ns: 'chat' }), MessageType.SYSTEM);
        });
    }

    private handleIncomingMessage(data: any) {
        if (data.type === 'game_invite_accepted' && data.action === 'navigate_to_pong') {
            this.notifySystemMessage(i18n.t('invitationAccepted', { ns: 'chat' }), MessageType.GAME);
            setTimeout(() => {
                const urlParams = new URLSearchParams({
                    invitation: 'true',
                    inviteId: data.inviteId,
                    hostName: data.hostName || 'Host',
                    guestName: data.guestName || 'Guest'
                });
                
                navigate(`/pong?${urlParams.toString()}`);
            }, 1500);
            return;
        }
        
        if (data.type === 'game_invite_declined') {
            this.notifySystemMessage(data.username + i18n.t('invitationDeclined', { ns: 'chat' }), MessageType.GAME);
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

        this.notifyMessageCallbacks(message);
    }

    registerMessageCallback(callback: (message: ChatMessage) => void) {
        this.messageCallbacks.push(callback);
    }

    registerSystemMessageCallback(callback: (content: string, type: MessageType) => void) {
        this.systemMessageCallbacks.push(callback);
    }

    private notifyMessageCallbacks(message: ChatMessage) {
        this.messageCallbacks.forEach(cb => cb(message));
    }

    private notifySystemMessage(content: string, type: MessageType) {
        this.systemMessageCallbacks.forEach(cb => cb(content, type));
    }

    sendMessage(message: any): boolean {
        if (this.socket.readyState !== WebSocket.OPEN) {
            this.notifySystemMessage(i18n.t('notConnected', { ns: 'chat' }), MessageType.SYSTEM);
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
            content: username + i18n.t('userChallenges', { ns: 'chat' }),
            inviteId: inviteId,
            timestamp: new Date().toISOString()
        };

        if (this.sendMessage(inviteMessage)) {
            this.notifySystemMessage(i18n.t('invitationSentTo', { ns: 'chat' }) + targetUser, MessageType.GAME);
        }
    }

    acceptGameInvite(inviteId: string, fromUser: string) {
        const username = sessionStorage.getItem('username') || 'Anonymous';
        
        const responseMessage = {
            type: MessageType.GAME_INVITE_RESPONSE,
            username: username,
            targetUser: fromUser,
            content: username + i18n.t('userAcceptsInvitation', { ns: 'chat' }),
            inviteId: inviteId,
            action: 'accept',
            timestamp: new Date().toISOString()
        };
        
        this.sendMessage(responseMessage);
        this.notifySystemMessage(i18n.t('acceptingInvitation', { ns: 'chat' }) + fromUser, MessageType.GAME);
    }

    declineGameInvite(inviteId: string, fromUser: string) {
        const username = sessionStorage.getItem('username') || 'Anonymous';
        
        const responseMessage = {
            type: MessageType.GAME_INVITE_RESPONSE,
            username: username,
            targetUser: fromUser,
            content: username + i18n.t('invitationDeclined', { ns: 'chat' }),
            inviteId: inviteId,
            action: 'decline',
            timestamp: new Date().toISOString()
        };
        
        this.sendMessage(responseMessage);
        this.notifySystemMessage(i18n.t('decliningInvitation', { ns: 'chat' }) + fromUser, MessageType.GAME);
    }

    isConnected(): boolean {
        return this.socket.readyState === WebSocket.OPEN;
    }
}