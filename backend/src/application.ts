import Bot from './bot';
import GameManager from './game-manager';
import { WebSocketManager } from './websocket-manager';
import logger from './logger';

class App {
	constructor() {
		this.gameManager = new GameManager(this);
	}
	bot: Bot | null = null;
	database: any | null = null;
	gameManager: GameManager;
	wsManager?: WebSocketManager;

	async prepare() {
		this.gameManager = new GameManager(this);
		await this.prepareBot();
	}

	async start(port: number) {
		this.wsManager = new WebSocketManager(this);
		this.wsManager.start(8080);
		this.Cleanup();
	}

	async prepareBot() {
		this.bot = new Bot(this);
		await this.bot.start();
	};

	Cleanup() {
		setInterval(() => {
			logger.info(`${this.gameManager.games.length} games in memory before cleanup`);
			this.gameManager.CleanupGames();
			this.wsManager?.CleanupClients();
			logger.info(`${this.gameManager.games.length} games in memory after cleanup`);
		}, 600*1000);
	}
}

export default App;