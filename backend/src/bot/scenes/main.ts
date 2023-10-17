import { Context, Scenes, deunionize } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import { message } from "telegraf/filters"
import moment from 'moment';
import BaseScene from '../base-scene.js';
import { Markup } from 'telegraf';
import Bot from "../index.js";
import logger from "../../logger.js";
import crypto from 'crypto';
const { enter, leave } = Scenes.Stage;

class MainScene extends BaseScene {
	constructor (bot: Bot) {
		super(bot);
	}


	get name() {
		return 'main';
	}

	get metaData() {
		return [
			{
				type: 'action',
				name: 'privateGame',
				func: this.privateGame,
			},
			{
				type: 'action',
				name: 'return',
				func: this.return,
			},
			{
				type: 'action',
				name: 'myGames',
				func: this.myGames,
			},
			{
				type: 'action',
				name: 'about',
				func: this.about,
			},
			{
				type: 'action',
				name: 'createSingleGame',
				func: this.createSingleGame,
			},
			{
				type: 'on',
				name: message('user_shared'),
				func: this.createGame,
			},
		];
	}
  
	async enter(ctx: Context) {
		try {
			await ctx.reply('Welcome to Chess!', Markup.inlineKeyboard([
				[Markup.button.callback('♟️ Play chess', 'privateGame')],
				[Markup.button.callback('🤖 Play with Bot', 'createSingleGame')],
				[Markup.button.callback('🏆 My games', 'myGames')],
				[Markup.button.callback('❓ How to use', 'about')],
			]));
		} catch (error: any) {
			logger.error(error.toString());
		}
	}

	async privateGame(ctx: Context) {
		try {
			const id = ctx.from?.id;
			await ctx.answerCbQuery();
			await ctx.reply('Choose your opponent', Markup.keyboard([[Markup.button.userRequest('Choose an opponent', 1234)]]).resize().oneTime());
		} catch (error: any) {				
			logger.error(error.toString());
		}
	}
	

	async sendStartNotification(to: number, text: string, url: string): Promise<number> {
		try {
			const msg = await this.bot.engine.telegram.sendMessage(to, text, Markup.inlineKeyboard([Markup.button.webApp('Play', url)]));
			return msg.message_id;
		} catch (error: any) {
			throw error;
		}
		
	}

	async createGame(ctx: Context) {
		if (ctx.from?.id) {
			const id = deunionize(ctx.message)?.user_shared?.user_id || -1;
			let gameId = '';
			try {
				gameId = this.bot.app.gameManager.CreateGame(ctx.from.id, id, ctx.from?.username || '');
				const url = `${process.env.FRONT_URL}?id=${gameId}`;
				const msg2 = await this.sendStartNotification(id, `@${ctx.from?.username || 'Somebody'} invites you to play chess!`, url);
				const msg1 = await this.sendStartNotification(ctx.from.id, 'Your game is ready', url);
				this.bot.app.gameManager.SetLastMessages(gameId, msg1, msg2);
			} catch (err: any) {
				logger.error(err.toString());
				if (err.code === 403 || err.message.toString() === '403' || err.code === 400 || err.message.toString() === '400') {
					await ctx.reply('Unfortunately, your opponent has not activated our bot. Send him an invitation!');
					await ctx.reply(`I invite you to play chess, right here @${process.env.BOT_NAME}`);
				}
				this.bot.app.gameManager.DeleteGame(gameId);
			}
		}
	}

	async createSingleGame(ctx: Context) {
		if (ctx.from?.id) {
			try {
				const gameId = this.bot.app.gameManager.CreateSingleGame(ctx.from.id);
				const url = `${process.env.FRONT_URL}?id=${gameId}&isSingle=true`;
				const msg1 = await this.sendStartNotification(ctx.from.id, 'Your game is ready', url);
				this.bot.app.gameManager.SetLastMessagesSingle(gameId, msg1);
			} catch (err: any) {
				logger.error(err.toString());
			}
		}
	}

	async myGames(ctx: Context) {
		try {
			await ctx.answerCbQuery();
			moment.locale('en');
			const id = ctx.from?.id;
			const invites = this.bot.app.gameManager.games.filter(game => game.players[1].tgId === id);
			const games = this.bot.app.gameManager.games.filter(game => game.players[0].tgId === id);
			if (invites.length > 0 || games.length > 0)
				await ctx.reply('Your games:');
			else 
				await ctx.reply('You don\'t have any games right now');
			for (let invite of invites) {
				const url = `${process.env.FRONT_URL}?id=${invite.id}`;
				const msg = `The game with @${invite.players[0].tgName}, ${invite.nowMoving === 1 ? 'your turn' : 'opponent\'s move'}, ${moment(invite.lastActivity).fromNow()}`;
				await ctx.reply(msg, Markup.inlineKeyboard([Markup.button.webApp('Play', url)]));
			}
			for (let game of games) {
				const url = `${process.env.FRONT_URL}?id=${game.id}`;
				const msg = `The game with @${game.players[1].tgName}, ${game.nowMoving === 0 ? 'your turn' : 'opponent\'s move'}, ${moment(game.lastActivity).fromNow()}`;
				await ctx.reply(msg, Markup.inlineKeyboard([Markup.button.webApp('Play', url)]));
			}
		} catch (error: any) {
			logger.error(error.toString());
		}
	}

	async about(ctx: Context) {
		try {
			await ctx.answerCbQuery();
			await this.bot.EditOrReply(ctx, `Welcome to the Chess! \n
			🎲 You can play with friends from your Telegram contacts list or practice with the bot.
			📲 To pause the game, simply close the game window. Your game will be saved and could be continued on any of your devices.
			🔔 To keep you up to date with the status of your game, you will receive notifications when your opponent makes a move and when you need to make a move. Remember that you will lose automatically after 24 hours if you don't make a move!
			🏆 You can run several games at once, the list of current games is available in the "My Games" section.`,
			Markup.inlineKeyboard([[Markup.button.callback('⬆ Main Menu', 'return')]]));
		} catch (error: any) {
			logger.error(error.toString());
		}
	}

	async return(ctx: Scenes.SceneContext) {
		try {
			await ctx.answerCbQuery();
			await this.bot.EditOrReply(ctx, 'Welcome to Chess!', Markup.inlineKeyboard([
				[Markup.button.callback('♟️ Play chess', 'privateGame')],
				[Markup.button.callback('🤖 Play with Bot', 'createSingleGame')],
				[Markup.button.callback('🏆 My games', 'myGames')],
				[Markup.button.callback('❓ How to use', 'about')],
			]))
		} catch (error: any) {
			logger.error(error.toString());
		}
	}

}

module.exports = MainScene;
