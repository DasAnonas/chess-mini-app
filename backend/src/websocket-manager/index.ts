import { createServer as createServerHTTPS } from 'https';
import { createServer as createServerHTTP} from 'http';
import { readFileSync } from 'fs';
import { WebSocket, WebSocketServer } from "ws";
import App from "../application";
import logger from '../logger';
import GameWrap from '../game-manager/game-wrap';
import SingleGameWrap from '../game-manager/single-game-wrap';

class WebSocketManager {
	constructor (app: App) {
		this.app = app
	}
	private server?: any;
	private connections: Array<WebSocketClient> = [];
	private app: App;

	start(port: number) {
		let server = createServerHTTP(); 
		if (process.env.PATH_CERT) {
			server = createServerHTTPS({
				cert: readFileSync(process.env.PATH_CERT || ''),
				key: readFileSync(process.env.PATH_KEY || ''),
			})
		}
		this.server = new WebSocketServer<WebSocket>({ server });
		this.server.on('connection', (ws: WebSocket) => {
			this.connections.push(new WebSocketClient(ws, this.app));
		})
		server.listen(8080)
	}

	DeleteClients(gameId: string) {
		const clients = this.connections.filter(item => item.gameId === gameId);
		for (let client of clients) 
			client.connection.close();
		this.connections = this.connections.filter(item => item.gameId !== gameId);
	}

	CleanupClients () {
		this.connections = this.connections.filter((item: WebSocketClient) => {
			const isGameIdValid = this.app.gameManager.games.some(game => game.id === item.gameId);
			return isGameIdValid
		});
	}
}

class WebSocketClient {
	constructor (ws: WebSocket, app: App) {
		this.connection = ws;
		this.app = app;
		this.playerIndex = 0;
		this.connection.on('message', this.ProceedMessage.bind(this));
		this.connection.on('close', this.CloseConnection.bind(this));
		this.connection.on('error', console.log);
	}
	connection: WebSocket;
	private app: App;
	gameId?: string;
	playerIndex: number;
	private pingTimeout?: NodeJS.Timeout;

	async ProceedMessage(data: string) {
		try {
			const parsedData = JSON.parse(data);
			logger.debug(`[WS Message Received] ${JSON.stringify(parsedData)}`)
			if (!parsedData.gameId) {
				this.connection.close();
				return;
			}
			
			let game : GameWrap | SingleGameWrap |undefined = this.app.gameManager.games.find(game => game.id === parsedData.gameId);
			if (!game)
				game = this.app.gameManager.singleGames.find(game => game.id === parsedData.gameId);
			if (!game) {
				this.Error('notFound');
				this.connection.close();
				return;
			}

			if (parsedData.action === 'ping')
				this.OnPing();	
			else 
				await game.MessageDispatcher(this, parsedData);
		} catch (error: any) {
			this.Error(error.message.toString());
			logger.error(error.message.toString())
		}
	}

	OnPing() {
		logger.debug(`[Ping Received]`)
		this.connection.send(JSON.stringify({action: 'pong'}));
		this.ResetPingTimeout();
		this.SetPingTimeout();
	}

	ResetPingTimeout() {
		logger.debug(`[Ping Reset]`)
		if (this.pingTimeout)
			clearTimeout(this.pingTimeout);
	}

	SetPingTimeout() {
		logger.debug(`[Ping Set]`)
		this.pingTimeout = setTimeout(() => {logger.debug(`[WS connection closed via timeout]`); this.connection.close()}, 40000)
	}

	CloseConnection() {
		let game: GameWrap | SingleGameWrap | undefined = this.app.gameManager.games.find(game => game.id === this.gameId);
		if (!game)
			game = this.app.gameManager.singleGames.find(game => game.id === this.gameId);
		if (game)
			game.Unsubscribe(this.playerIndex);
		this.ResetPingTimeout();
	}

	async GameStateChanged(data: any) {
		switch (data.type) {
			case 'start':
				await this.OnStart(data);
				break;
			case 'move':
				await this.OnMove(data);
				break;
			case 'endGame':
				await this.OnEndGame(data);
				break;
		}
	}

	async Send(data: any) {
		const message = JSON.stringify(data)
		logger.debug(`[WS Message Sending] ${message}`);
		this.connection.send(message);
	}

	async OnStart(data: any) {
		await this.Send({
			action: 'start',
			nowMoving: data.nowMoving,
			name: this.playerIndex === 0 ? data.names[1] : data.names[0],
			avatar: this.playerIndex === 0 ? data.avatars[1] : data.avatars[0],
		});
	}

	async OnMove(data: any) {
		if (data.initiator === this.playerIndex)
			await this.Send({ action: 'status', status: 'ok' });
		else 
			await this.Send({ action: 'move', move: data.move });
	}

	async OnEndGame(data: any) {
		let status = 'draw';
		if (data.initiator !== undefined)
			status = data.initiator === this.playerIndex ? 'win' : 'lose';

		await this.Send({ action: 'endGame', status: status });
	}

	async Error(type: string) {
		await this.Send({ action: 'error', type: type });
	}

	async RecoveryState(data: any) {
		await this.Send({
			action: 'recovery',
			fen: data.fen,
			isMyMove: data.isMyMove,
			isWhite: data.isWhite,
			name: data.name,
			avatar: data.avatar,
			isSoundEnabled: data.isSoundEnabled
		});
	}
}


export {WebSocketClient, WebSocketManager}