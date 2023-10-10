import { WebSocketClient } from "../websocket-manager"; 
import GameWrap from "./base-game-wrap";
import { Markup } from "telegraf";

class SingleGameWrap extends GameWrap {

	async MessageDispatcher (wsClient: WebSocketClient, data: any) {
		this.UpdateLastActivity();
		switch (data.action) {
			case 'join':
				await this.JoinClient(wsClient, data);
				break;
			case 'endGame':
				await this.EndGame();
				break;
		}
	}

	async JoinClient(wsClient: WebSocketClient, data: any) {
		const id = parseInt(data.userId);
		if (this.checkAuthenticity(wsClient, data) && id) {
			if (this.players[0].tgId === id && !this.players[0].wsClient) {
				await this.Subscribe(wsClient,0);
			} else 
				throw new Error('forbidden');
		}
	}

	async EndGame() {
		await this.SendTgNotifications({type: 'endGame'});
		this.CleanupTgMessages();
		this.app.gameManager.DeleteGame(this.id);
	}

	async SendTgNotifications(data: any) {
		switch (data.type) {
			case 'endGame':
				if (data.initiator === 0) 
					await this.app.bot?.notifications.NotifyWin(this.players[0].tgId, 'Bot', 'win');
				if (data.initiator === 1) 
					await this.app.bot?.notifications.NotifyWin(this.players[0].tgId, 'Bot', 'lose');
				if (data.initiator === undefined) 
					await this.app.bot?.notifications.NotifyWin(this.players[0].tgId, 'Bot', 'draw');
				break;
		}		
	}
}

export default SingleGameWrap;