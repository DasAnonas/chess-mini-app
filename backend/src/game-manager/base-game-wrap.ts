import { WebSocketClient } from "../websocket-manager"; 
import GameClient from './game-client';
import crypto from 'crypto';
import App from '../application';
import logger from "../logger";
import { Chess } from 'chess.js'

abstract class GameWrap {
	constructor (hostTelegramId: number, app: App) {
		this.id = crypto.randomUUID();
		this.players = [new GameClient(hostTelegramId)];
		this.app = app;
		this.lastActivity = new Date();
		this.engine = new Chess();
	}
	app: App;
	players: GameClient[];
	id: string;
	engine: Chess;
	nowMoving?: number;
	lastActivity: Date;
	
	checkAuthenticity(wsClient: WebSocketClient, data: any):boolean {
		if (data.string?.length > 0 && data.hash?.length > 0) {
			const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.TG_TOKEN || '').digest();
			const result = crypto.createHmac('sha256', secret).update(data.string).digest('hex');
			if (result === data.hash)
				return true;
		}
		logger.error('failed validation');
		wsClient.connection.close();
		return false;
	}

	async Subscribe (player: WebSocketClient, num: number) {
		if (this.players[num]) {
			this.players[num].wsClient = player;
			this.players[num].wsClient!.gameId = this.id;
			this.players[num].wsClient!.playerIndex = num;
			this.players[num].wsClient!.SetPingTimeout();
			if (this.nowMoving !== undefined)
				await this.Recovery(player);
		}
	}

	async Recovery(wsClient: WebSocketClient) {
		throw new Error('Method must be overridden');
	}

	Unsubscribe (num: number) {
		if (this.players[num])
			this.players[num].wsClient = undefined;
	}

	async Notify (data: any) {
		for (let i=0; i < this.players.length; i++) {
			if (this.players[i].wsClient)
				await this.players[i].wsClient!.GameStateChanged(data);
		}
		await this.SendTgNotifications(data);
	}

	async SendTgNotifications(data: any) {}

	CleanupTgMessages() {
		for (let i=0; i < this.players.length; i++) {
			this.app.bot?.DeleteMessage(this.players[i].tgId, this.players[i].notificationMessages.lastInvite || -1);
		}
	}

	ProceedSwitchSound(wsClient: WebSocketClient) {
		if (this.players[wsClient.playerIndex])
			this.players[wsClient.playerIndex].isSoundEnabled = !this.players[wsClient.playerIndex].isSoundEnabled;
	}

	async FinishGame(winnerIndex?: number) {
		await this.Notify({
			type: 'endGame',
			initiator: winnerIndex,
		});
		this.CleanupTgMessages();
		this.app.gameManager.DeleteGame(this.id);
	}

	UpdateLastActivity() {
		this.lastActivity = new Date();
		for (let i=0; i < this.players.length; i++) {
			this.players[i].notificationMessages.oneHCall = false;
			this.players[i].notificationMessages.twelveHCall = false;
			this.players[i].notificationMessages.tenMCall = false;
		}
	}
}

export default GameWrap;