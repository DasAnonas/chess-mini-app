class UserActions {
	constructor (gm) {
		this.gm = gm;
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

	onDrop(dropEvt) {
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
		if (move) 
			this.move(dropEvt.source, dropEvt.target)
		else 
			return 'snapback';
	}

	onSnapEnd () {
		this.gm.board.position(this.gm.engine.fen())
	}

	move(from, to) {
		this.gm.boardState.canMove = false;
		this.gm.soundEngine.Move();
		this.gm.board.fen(this.gm.engine.fen());
		this.gm.ws.send({action: 'move', move: [from, to]});
	}

	unselectItem() {
		//this.gm.soundEngine.Select();
		this.gm.boardState.pendingMove = null
		this.gm.board.clearCircles();
	}

	isMyItem(piece) {
		const identity = this.gm.boardState.isWhite ? /^w/ : /^b/;
		return identity.test(piece);
	}

	surrenderModal() {
		this.gm.boardState.showSurrender = true;
	}

	surrender() {
		this.gm.ws.send({action: 'surrender'});
	}

	switchSound() {
		this.gm.soundEngine.isSoundOn = !this.gm.soundEngine.isSoundOn;
		this.gm.ws.send({action: 'switchSound'});
	}
}

export default UserActions;