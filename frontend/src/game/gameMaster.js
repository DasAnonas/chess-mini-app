import { reactive } from 'vue';
import { Chess } from 'chess.js'
import { Chessboard2 } from '/node_modules/@chrisoakman/chessboard2/dist/chessboard2.min.mjs'
import SoundEngine from './soundEngine';
import WsActions from './wsActions';
import UserActions from './userActions.js';
import WsClient from '../wsClient.js';
import Locale from './locale';
import UserActionsSingle from './userActionsSingle';

class GameMaster {
	constructor (gameId, isSingle) {
		this.locale = new Locale();
		this.boardState = reactive({
			gameId: gameId,
			playerId: undefined,
			statusLabel: this.locale.$waitingOpponent,
			isWhite: undefined,
			isMyMove: false,
			canMove: false,
			opponent: {
				name: '',
				avatar: '/ava.JPG'
			},
			popup: {
				show: false,
				type: 'error',
				text: undefined
			},
			board: {
				dimensions: {
					pX: '0%',
					pY: '0%',
				},
				width: 0,
				name: 'standart',
			},
		});
		this.engine = new Chess();
		this.soundEngine = reactive(new SoundEngine());
		this.wsActions = new WsActions(this);
		if (isSingle) 
			this.userActions = new UserActionsSingle(this);
		else 
			this.userActions = new UserActions(this);
		this.initWs();
	}

	initWs() {
		const [securitycheckDataString, hash] = this.getSecurityString();
		const username = this.getTelegramUserData();
		this.ws = new WsClient({
			gameId: this.boardState.gameId,
			userId: this.boardState.playerId,
			tgName: username,
			url: "wss://" + location.host + "/websockets",
			hash: hash,
			securitycheckDataString: securitycheckDataString,
		}, 
		{
			messageCallback: () => {},
			openCallback: () => {
				if (!['win', 'lose', 'draw'].includes(this.boardState.popup.type))
					this.boardState.popup.show = false
			},
			closeCallback: (ev) => {this.wsActions.showError({text: this.locale.$wsClose}); console.log(ev.reason)},
			errorCallback: (error) => {this.wsActions.showError({text: this.locale.$wsError}); console.log(error)},
		});
	}

	initBoard() {
		this.board = new Chessboard2('chessBoard', {
			position: this.engine.fen(),
			orientation: this.boardState.isWhite ? 'white' : 'black',
			draggable: true,
			snapSpeed: 1,
			onDragStart: this.userActions.onDragStart.bind(this.userActions),
			onDrop: this.userActions.onDrop.bind(this.userActions),
			onSnapEnd: this.userActions.onSnapEnd.bind(this.userActions),
		});
		this.board.resize();
	}

	getSecurityString() {
		const initDataURLSP = new URLSearchParams(window.Telegram.WebApp.initData);
		const authDate = initDataURLSP.get('auth_date');
		const queryId = initDataURLSP.get('query_id');
		const user = initDataURLSP.get('user');
		const hash = initDataURLSP.get('hash');
		const securitycheckDataString = `auth_date=${authDate}\nquery_id=${queryId}\nuser=${user}`;
		return [securitycheckDataString, hash]
	}

	getTelegramUserData() {
		this.boardState.playerId = window.Telegram.WebApp.initDataUnsafe?.user?.id.toString() || '';
		const playerName = window.Telegram.WebApp.initDataUnsafe?.user?.username?.toString() || '';
		return playerName;
	}

	async checkQueue() {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			if(this.ws?.messageQueue && this.ws?.messageQueue.length > 0) {
					await this.wsDispatcher(this.ws.messageQueue[0]);
					this.ws.messageQueue.shift();
			}
			await new Promise((resolve) => {setTimeout(resolve, 50)});
		}
	}

	async wsDispatcher(data) {
		switch (data.action) {
			case 'start':
				await this.wsActions.startGame(data);
				break;
			case 'status':
				await this.wsActions.proceedStatus(data);
				break;
			case 'invalidState':
				await this.wsActions.actualiseState(data);
				break;
			case 'move':
				await this.wsActions.moveOpponent(data);
				break;
			case 'moveOver':
				await this.wsActions.endOpponentMove(data);
				break;
			case 'endGame':
				await this.wsActions.finishGame(data);
				break;
			case 'retractMove':
				await this.wsActions.retractOpponentMove(data);
				break;
			case 'error':
				await this.wsActions.showError(data);
				break;
			case 'recovery':
				await this.wsActions.actualiseState(data);
				break;
			case 'decorations':
				await this.wsActions.setDecorations(data);
				break;
			case 'pong':
				this.ws.resetPingTimeout();
				break;
			default: console.log(data);
		}
	}
}

export default GameMaster;