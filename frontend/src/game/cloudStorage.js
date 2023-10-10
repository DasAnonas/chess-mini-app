class CloudStorage {
	constructor (gm) {
		this.gm = gm;
	}

	async SaveGame() {
		try {
			const data = JSON.stringify({
				fen: this.gm.engine.fen(),
				isSoundEnabled: this.gm.soundEngine.isSoundOn,
				isMyMove: this.gm.boardState.isMyMove,
				isWhite: this.gm.boardState.isWhite,
			});
			await window.Telegram.WebApp.CloudStorage.setItem(this.gm.boardState.gameId, data);
		} catch (error) {
			console.log(error);
			this.gm.wsActions.showError({text: this.gm.locale.$tgError});
		}
	}

	async LoadGame() {
		try {
			let game = await new Promise ((resolve, reject) => {
				window.Telegram.WebApp.CloudStorage.getItem(this.gm.boardState.gameId, (a,b) =>
				{
					if (a)
						return reject(a);
					resolve(b);
				});
			});
			if (!game)
				return null;
			game = JSON.parse(game);
			return game;
		} catch (error) {
			console.log(error);
			this.gm.wsActions.showError({text: this.gm.locale.$tgError});
		}
	}

	async DeleteGame() {
		try {
			await window.Telegram.WebApp.CloudStorage.removeItem(this.gm.boardState.gameId);
		} catch (error) {
			console.log(error);
			this.gm.wsActions.showError({text: this.gm.locale.$tgError});
		}
	}
}
export default CloudStorage;