import { WebSocketClient } from "../websocket-manager";

type NotificationMessages = {lastInvite: number | null, twelveHCall: boolean, oneHCall: boolean, tenMCall: boolean}

class GameClient {
	constructor (telegramId: number, tgName?: string) {
		this.tgId = telegramId;
		this.tgName = tgName || 'Player';
		this.notificationMessages = {lastInvite: null, twelveHCall: false, oneHCall: false, tenMCall: false};
		this.isSoundEnabled = true;
	}
	tgId: number;
	tgName?: string;
	avatar?: string;
	wsClient?: WebSocketClient;
	isFirstMoving?: boolean;
	notificationMessages: NotificationMessages;
	isSoundEnabled: boolean;
}

export default GameClient;