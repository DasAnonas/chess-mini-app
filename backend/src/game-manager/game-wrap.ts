import { WebSocketClient } from "../websocket-manager"; 
import GameClient from './game-client';
import App from '../application';
import GameWrap from "./base-game-wrap";
import { game } from "telegraf/typings/button";

class PrivateGameWrap extends GameWrap {
	constructor (telegramId: number, hostName: string, ...args: [number, App]) {
		super(...args);
		this.players.push(new GameClient(telegramId));
		this.players[0].tgName = hostName || 'Player';
	}

	async MessageDispatcher (wsClient: WebSocketClient, data: any) {
		this.UpdateLastActivity();
		switch (data.action) {
			case 'join':
				await this.JoinClient(wsClient, data);
				break;
			case 'move':
				await this.ProceedMove(wsClient, data);
				break;
			case 'surrender':
				await this.ProceedSurrender(wsClient, data);
				break;
			case 'switchSound':
				this.ProceedSwitchSound(wsClient);
				break;
		}
	}

	async JoinClient(wsClient: WebSocketClient, data: any) {
		const id = parseInt(data.userId);
		if (!this.checkAuthenticity(wsClient, data) || !id)
			return
		if (this.players[0].tgId === id && !this.players[0].wsClient) {
			await this.Subscribe(wsClient, 0);
			this.players[0].tgName = data.tgName || 'Player';
			if (!this.players[0].avatar)
				this.players[0].avatar = await this.app.bot?.GetProfilePic(this.players[0].tgId);
			return;
		}

		if (!(this.players[1].tgId === id && !this.players[1].wsClient))
			throw new Error('forbidden');


		await this.Subscribe(wsClient, 1);
		if (!this.players[1].avatar)
			this.players[1].avatar = await this.app.bot?.GetProfilePic(this.players[1].tgId);
		console.log(data.tgName)
		this.players[1].tgName = data.tgName || 'Player';
		if (this.nowMoving === undefined)
			await this.LaunchGame();
	}

	async LaunchGame() {
		this.nowMoving = Math.round(Math.random());
		this.players[0].isFirstMoving = this.nowMoving === 0;
		this.players[1].isFirstMoving = this.nowMoving === 1;
		await this.NotifyStart(this.players[0].isFirstMoving);
		await this.Notify({
			type: 'start',
			nowMoving: this.players[this.nowMoving].tgId,
			names: [this.players[0].tgName, this.players[1].tgName],
			avatars: [this.players[0].avatar, this.players[1].avatar]
		});
	}

	async ProceedMove(wsClient: WebSocketClient, data: any) {
		if (this.id !== wsClient.gameId)
			throw new Error('forbidden');
		if (this.nowMoving === wsClient.playerIndex && data.move) {
			try {
				this.engine.move({
					from: data.move[0],
					to: data.move[1],
					promotion: 'q'
				});
			} catch (error) {
				await this.Recovery(wsClient);
				return;
			}
			await this.Notify({
				type: 'move',
				initiator: wsClient.playerIndex,
				move: data.move
			});
			this.CheckEndGame();
			return;
		}
		await this.Recovery(wsClient);
	}

	async CheckEndGame() {
		if (this.engine.isCheckmate()) {
			this.FinishGame(this.nowMoving);
			return;
		}
		if (this.engine.isDraw() || this.engine.isInsufficientMaterial() || this.engine.isStalemate() || this.engine.isThreefoldRepetition()) {
			this.FinishGame();
			return;
		}
		this.nowMoving = this.nowMoving === 0 ? 1 : 0;
	}

	async ProceedSurrender(wsClient: WebSocketClient, data: any) {
		if (this.id !== wsClient.gameId)
			throw new Error('forbidden');
		if (this.nowMoving !== undefined) 
			await this.FinishGame(wsClient.playerIndex === 0 ? 1:0);
	}

	async Recovery(wsClient: WebSocketClient) {
		await wsClient.RecoveryState({
			fen: this.engine.fen(),
			isMyMove: wsClient.playerIndex === this.nowMoving,
			isWhite: this.players[wsClient.playerIndex].isFirstMoving,
			name: wsClient.playerIndex === 0 ? this.players[1].tgName : this.players[0].tgName,
			avatar: wsClient.playerIndex === 0 ? this.players[1].avatar : this.players[0].avatar,
			isSoundEnabled: this.players[wsClient.playerIndex].isSoundEnabled,
		});
	}

	async SendTgNotifications(data: any) {
		switch (data.type) {
			case 'moveOver':
				if (!this.players[0].wsClient && data.initiator === 1)
					this.players[0].notificationMessages.lastInvite = await this.app.bot?.notifications.NotifyMove(this.players[0].tgId, this.players[1].tgName || '', this.id, this.players[0].notificationMessages.lastInvite) || null;
				if (!this.players[1].wsClient && data.initiator === 0)
					this.players[1].notificationMessages.lastInvite = await this.app.bot?.notifications.NotifyMove(this.players[1].tgId, this.players[0].tgName || '', this.id, this.players[1].notificationMessages.lastInvite) || null;	
				break;	
			case 'endGame':
				if (data.initiator === 0) {
					await this.app.bot?.notifications.NotifyWin(this.players[0].tgId, this.players[1].tgName || '', 'win');
					await this.app.bot?.notifications.NotifyWin(this.players[1].tgId, this.players[0].tgName || '', 'lose');
				}
				if (data.initiator === 1) {
					await this.app.bot?.notifications.NotifyWin(this.players[0].tgId, this.players[1].tgName || '', 'lose');
					await this.app.bot?.notifications.NotifyWin(this.players[1].tgId, this.players[0].tgName || '', 'win');
				}
				if (data.initiator === undefined) {
					await this.app.bot?.notifications.NotifyWin(this.players[0].tgId, this.players[1].tgName || '', 'draw');
					await this.app.bot?.notifications.NotifyWin(this.players[1].tgId, this.players[0].tgName || '', 'draw');
				}
				break;
		}		
	}

	async NotifyStart(isNowMoving: boolean) {
		if (!this.players[0].wsClient)
			this.players[0].notificationMessages.lastInvite = await this.app.bot?.notifications.NotifyStart(this.players[0].tgId, this.players[1].tgName || '', this.id, isNowMoving, this.players[0].notificationMessages.lastInvite) || null;
	}
}

export default PrivateGameWrap;