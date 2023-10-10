import Bot from ".";
import { Markup } from 'telegraf';

class Notifications {
	constructor(bot: Bot) {
		this.bot = bot;
	}
	bot: Bot;

	async NotifyStart(id: number, name: string, game: string, isNowMoving: boolean, messageId?: number | null): Promise<number | null> {
		let msg = (name.length>0 ? `@${name}` : 'Your opponent') + ' has joined, the game is on!';
		if (isNowMoving)
			msg += ' Your turn!'
		const url = `${process.env.FRONT_URL}?id=${game}`;
		const message = await this.bot.Send(id, msg, Markup.inlineKeyboard([Markup.button.webApp('Play', url)]));
		if (messageId)
			await this.bot.DeleteMessage(id, messageId);
		return message;
	}

	async NotifyMove(id: number, name: string, game: string, messageId?: number | null): Promise<number | null> {
		const msg = 'Your turn' + (name.length>0 ? ` in the game with @${name}` : 'in the game');
		const url = `${process.env.FRONT_URL}?id=${game}`;
		const message = await this.bot.Send(id, msg, Markup.inlineKeyboard([Markup.button.webApp('Play', url)]));
		if (messageId)
			await this.bot.DeleteMessage(id, messageId);
		return message;
	}

	async NotifyWin(id: number, name: string, type: string) {
		let outcome = '';
		if (type === 'win')
			outcome = 'won';
		if (type === 'lose')
			outcome = 'lost';
		if (type === 'draw')
			outcome = 'drew';
		const msg = `You ${outcome} in the game with @${name}`;
		await this.bot.Send(id, msg);
	}

	async NotifyTimeout(to: number, opponent: string, game: string, time: string, messageId?: number | null): Promise<number | null> {
		const gameLink = `${process.env.FRONT_URL}?id=${game}`;
		let timestamp = '';
		switch(time) {
			case '12h':
				timestamp = 'You have 12 hours';
				break;
			case '1h':
				timestamp = 'You have 1 hour';
				break;
			case '5m':
				timestamp = 'You have 5 minutes';
				break;
		}
		const text = `${timestamp} to make a move in the game with @${opponent}. Otherwise, you'll lose!`;
		const message = await this.bot.Send(to, text, Markup.inlineKeyboard([Markup.button.webApp('Play', gameLink)]));
		if (messageId)
			await this.bot.DeleteMessage(to, messageId);
		return message;
	}

}

export default Notifications;