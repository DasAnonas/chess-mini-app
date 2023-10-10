class Locale {
	constructor () {
		this.$yourMove = 'Your Move';
		this.$opponentMove = `Opponent's Move`;
		this.$waitingOpponent = 'Waiting for the Opponent';
		this.$retract = 'Retract';
		this.$surrender = 'Surrender';
		this.$statusWin = 'You Win!'
		this.$statusLose = 'You Lose!';
		this.$statusDraw = 'Draw!';
		this.$statusError = 'An error have occured';
		this.$surrenderWarning = 'Are you sure? To pause the game, just close this window, your game will be saved and waiting for your return!';
		this.$surrenderYes = 'OK';
		this.$surrenderNo = 'Cancel';
		this.$errorForbidden = `You do not have access. Make sure that the game window is opened on only one device`;
		this.$errorNotFound = 'The game is not found';
		this.$wsClose = 'The connection was closed';
		this.$wsError = 'The connection error';
		this.$tgError = 'Telegram version is not supported!';
	}

}

export default Locale;