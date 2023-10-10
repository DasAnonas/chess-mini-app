import App from '../application';
import PrivateGameWrap from './game-wrap';
import logger from "../logger";
import { Markup } from 'telegraf';
import SingleGameWrap from './single-game-wrap';

class GameManager {
	constructor (app: App) {
		this.app = app;
	}
	games: Array<PrivateGameWrap> = [];
	singleGames: Array<SingleGameWrap> = [];
	app: App;

	CreateGame(host: number, player: number, hostName: string): string {
		if (!host || !player) 
			throw new Error('403');
		const game = new PrivateGameWrap(player, hostName, host, this.app)
		this.games.push(game);
		return game.id;
	}

	CreateSingleGame(host: number): string {
		if (!host) 
			throw new Error('403');
		const game = new SingleGameWrap(host, this.app)
		this.singleGames.push(game);
		return game.id;
	}

	DeleteGame(id: string) {
		this.app.wsManager?.DeleteClients(id);
		const game = this.games.findIndex(item => item.id === id);
		if (game > -1) 
			this.games.splice(game, 1);
		else {
			const single = this.singleGames.findIndex(item => item.id === id);
			if (single > -1) 
				this.singleGames.splice(single, 1);
		}
	}

	async CleanupGames() {
		for (let game of this.games)
			await this.CleanupGame(game);
		for (let single of this.singleGames)
			await this.CleanupGame(single);
	}

	async CleanupGame(game: PrivateGameWrap | SingleGameWrap) {
		const now = new Date();
		const duration = now.getTime() - game.lastActivity.getTime();
		if (game.players[game.nowMoving === undefined ? -1 : game.nowMoving]) {
			const player = game.players[game.nowMoving === undefined ? -1 : game.nowMoving];
			const opponent = game.nowMoving === 0 ? game.players[1] : game.players[0];
			if (duration > 12 * 3600 * 1000 && !player.notificationMessages.twelveHCall) {
				player.notificationMessages.lastInvite = await this.app.bot!.notifications.NotifyTimeout(player.tgId, opponent?.tgName || '', game.id, '12h', player.notificationMessages.lastInvite)
				player.notificationMessages.twelveHCall = true;
			}
			if (duration > 23 * 3600 * 1000 && !player.notificationMessages.oneHCall) {
				player.notificationMessages.lastInvite = await this.app.bot!.notifications.NotifyTimeout(player.tgId, opponent?.tgName || '', game.id, '1h', player.notificationMessages.lastInvite)
				player.notificationMessages.oneHCall = true;
			}
			if (duration > (23 * 3600 * 1000 + 55 * 60 * 1000) && !player.notificationMessages.tenMCall) {
				player.notificationMessages.lastInvite = await this.app.bot!.notifications.NotifyTimeout(player.tgId, opponent?.tgName || '', game.id, '5m', player.notificationMessages.lastInvite)
				player.notificationMessages.tenMCall = true;
			}
		}
		if (duration > 24 * 3600 * 1000) {
			let winnerIndex : number | undefined
			if (game.nowMoving !== undefined)
				winnerIndex = game.nowMoving === 0 ? 1:0
			await game.FinishGame(winnerIndex)
		}
	}

	SetLastMessages (gameId: string, msg1: number, msg2: number) {
		const gameIndex = this.games.findIndex(game => game.id === gameId);
		this.games[gameIndex].players[0].notificationMessages.lastInvite = msg1;
		this.games[gameIndex].players[1].notificationMessages.lastInvite = msg2;
	}

	SetLastMessagesSingle (gameId: string, msg1: number) {
		const gameIndex = this.singleGames.findIndex(game => game.id === gameId);
		this.singleGames[gameIndex].players[0].notificationMessages.lastInvite = msg1;
	}
}

export default GameManager;