class WsActions {
	constructor (gm) {
		this.gm = gm;
	}

	async startGame(data) {
		this.gm.boardState.popup.show = false;
		this.gm.boardState.isMyMove = data.nowMoving.toString() === this.gm.boardState.playerId;
		if (this.gm.boardState.isMyMove) {
			this.gm.boardState.statusLabel = this.gm.locale.$yourMove;
			this.gm.boardState.isWhite = true;
			this.gm.boardState.canMove = true;
		} else {
			this.gm.boardState.statusLabel = this.gm.locale.$opponentMove;
			this.gm.boardState.isWhite = false;
		}
		this.gm.boardState.opponent = {
			name: data.name,
			avatar: data.avatar?.length > 0 ? data.avatar : '/ava.JPG'
		}
		this.gm.initBoard();
	}

	async proceedStatus(data) {
		if (!this.gm.boardState.canMove && this.gm.boardState.isMyMove && data.status === 'ok') {
			this.gm.boardState.isMyMove = false;
			this.gm.boardState.statusLabel = this.gm.locale.$opponentMove;
		}
	}

	async actualiseState(data) {
		this.gm.boardState.popup.show = false;
		this.gm.boardState.statusLabel = data.isMyMove? this.gm.locale.$yourMove : this.gm.locale.$opponentMove;
		this.gm.boardState.isWhite = data.isWhite;
		this.gm.boardState.isMyMove = data.isMyMove;
		this.gm.boardState.canMove = data.isMyMove;
		this.gm.boardState.showSurrender = false; 
		this.gm.soundEngine.isSoundOn = data.isSoundEnabled;
		this.gm.boardState.opponent = {
			name: data.name,
			avatar: data.avatar?.length > 0 ? data.avatar : '/ava.JPG'
		}
		this.gm.engine.load(data.fen);
		this.gm.initBoard();
	}

	async moveOpponent(data) {
		this.gm.engine.move({from: data.move[0], to: data.move[1]});
		this.gm.board.fen(this.gm.engine.fen());
		this.gm.soundEngine.Move();
		this.gm.boardState.canMove = true;
		this.gm.boardState.isMyMove = true;
		this.gm.boardState.statusLabel = this.gm.locale.$yourMove;
		this.gm.soundEngine.Move();
	}

	async finishGame (data) {
		this.gm.boardState.popup.show = true;
		if (data.status === 'draw' || data.status === 'win' || data.status === 'lose')
			this.gm.boardState.popup.type = data.status;
		this.gm.ws.isGameOver = true;
	}

	async showError(data) {
		await new Promise((resolve) => {setTimeout(resolve, 1000)});
		if (!['win', 'lose', 'draw'].includes(this.gm.boardState.popup.type)) {
			this.gm.boardState.popup.show = true;
			this.gm.boardState.popup.type = 'error';
			if (data.text)
				this.gm.boardState.popup.text = data.text;
			else if (data.type === 'forbidden')
				this.gm.boardState.popup.text = this.gm.locale.$errorForbidden;
			else if (data.type === 'notFound')
				this.gm.boardState.popup.text = this.gm.locale.$errorNotFound;
		}
	}
}

export default WsActions;