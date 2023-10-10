import { nextTick } from 'vue';
import Bot from './bot';
import CloudStorage from './cloudStorage';

class UserActionsSingle {
    constructor (gm) {
		this.gm = gm;
        this.bot = new Bot(gm);
		this.cloudStorage = new CloudStorage(gm);
	}

	onDragStart(dragStartEvt) {
		if (!this.gm.boardState.isMyMove || !this.gm.boardState.canMove || !this.isMyItem(dragStartEvt.piece))
			return false;
		const legalMoves = this.gm.engine.moves({
			square: dragStartEvt.square,
			verbose: true
		});
		console.log(legalMoves)
		if (legalMoves.length === 0) 
			return false
		legalMoves.forEach((move) => {
			this.gm.board.addCircle(move.to)
		});
	}

	async onDrop(dropEvt) {
		let move;
		try {
			move = this.gm.engine.move({
				from: dropEvt.source,
				to: dropEvt.target,
				promotion: 'q'
			});
		} catch (error) {
			console.log(error);
		}
		
		this.unselectItem();
		if (move) {
			this.gm.boardState.canMove = false;
			this.gm.boardState.isMyMove = false;
			this.gm.boardState.statusLabel = this.gm.locale.$opponentMove;
			await this.cloudStorage.SaveGame();
			const isOver = await this.move(dropEvt.source, dropEvt.target);
			if (!isOver)
				window.setTimeout(() => this.runOpponentMove(), 200);	
		} else 
			return 'snapback';
	}

	onSnapEnd () {
		this.gm.board.position(this.gm.engine.fen())
	}

	async move() {
		this.gm.soundEngine.Move();
		this.gm.board.fen(this.gm.engine.fen());
		const isOver = this.checkEnding();
		return isOver;
	}

    async runOpponentMove() {
        const move = await this.bot.getBestMove();
        this.gm.engine.move(move);
        this.move();
        this.gm.boardState.isMyMove = true;
        this.gm.boardState.statusLabel = this.gm.locale.$yourMove;
        this.gm.boardState.canMove = true;
		await this.cloudStorage.SaveGame();
		await nextTick();
		this.gm.soundEngine.NotifyMove();
    }

    async checkEnding() {
        if (this.gm.engine.isCheckmate()) {
			await this.finishGame(this.gm.isMyMove ? 'win' : 'lose');
            return true;
        }
          if (this.gm.engine.isDraw() || this.gm.engine.isInsufficientMaterial() || this.gm.engine.isStalemate() || this.gm.engine.isThreefoldRepetition()) {
            this.finishGame('draw');
            return true;
        }
		return false;
    }

    async startGame() {
        const game = await this.cloudStorage.LoadGame();
		if (game) {
			game.name = 'Bot';
			this.gm.wsActions.actualiseState(game);
			if (!game.isMyMove) {
				await new Promise((resolve) => {setTimeout(resolve, 1000)});
				await this.runOpponentMove();
			}	
		}	
		else 
			await this.initGame();
    }

	async initGame() {
		const isMyMove = Math.random() < 0.5;
        if (isMyMove) {
            this.gm.wsActions.startGame({
				nowMoving: this.gm.boardState.playerId,
				name: 'Bot'
			});
			await this.cloudStorage.SaveGame();
        } else {
            this.gm.wsActions.startGame({
				nowMoving: this.gm.boardState.playerId + 1,
				name: 'Bot'
			});
			await this.cloudStorage.SaveGame();
			await new Promise((resolve) => {setTimeout(resolve, 1000)});
            this.runOpponentMove();
        }
	}

	isMyItem(piece) {
		const identity = this.gm.boardState.isWhite ? /^w/ : /^b/;
		return identity.test(piece);
	}

	unselectItem() {
		//this.gm.soundEngine.Select();
		this.gm.boardState.pendingMove = null
		this.gm.board.clearCircles();
	}

	surrenderModal() {
		this.gm.boardState.showSurrender = true;
	}
	
	async surrender() {
		await this.finishGame('lose').bind(this);
	}
	
	async finishGame(status) {
		this.gm.wsActions.finishGame({status});
		await this.cloudStorage.DeleteGame();
		this.gm.ws.send({action: 'endGame'});
	}

	async switchSound() {
		this.gm.soundEngine.isSoundOn = !this.gm.soundEngine.isSoundOn;
		await this.cloudStorage.SaveGame();
	}

	
}

export default UserActionsSingle;