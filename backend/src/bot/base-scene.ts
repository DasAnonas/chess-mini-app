import { Context, Markup, deunionize } from "telegraf";
import { message } from "telegraf/filters";
import Bot from ".";
import SceneMetadata from "./scene-metadata";
import { SceneContext } from "telegraf/typings/scenes";
import logger from "../logger";

const {Scenes} = require('telegraf');

class BaseScene {
	constructor (bot: Bot) {
		this.bot = bot;	
	}
	
	bot: Bot;

	get name():string {
		throw new Error('Method must be overridden');
	}

	get metaData() : Array<SceneMetadata> {
		throw new Error('Method must be overridden');
	}

	async enter(ctx: Context) {
		throw new Error('Method must be overridden');
	}

	async main(ctx: SceneContext) {
		try {
			await ctx.scene.enter('main');
		} catch (error: any) {
			logger.error(error.toString());
		}
	}

	async start(ctx: Context) {
		try {
			await ctx.reply(`Welcome to the Chess! \n
			🎲 You can play with friends from your Telegram contacts list or practice with the bot.
			📲 To pause the game, simply close the game window. Your game will be saved and could be continued on any of your devices.
			🔔 To keep you up to date with the status of your game, you will receive notifications when your opponent makes a move and when you need to make a move. Remember that you will lose automatically after 24 hours if you don't make a move!
			🏆 You can run several games at once, the list of current games is available in the "My Games" section.`,
			Markup.inlineKeyboard([[Markup.button.callback('⬆ Main Menu', 'return')]]));
		} catch (error: any) {
			logger.error(error.toString());
		}	
	}

	async onMessage(ctx: SceneContext) {
		try {
			await this.onStart(ctx);
		} catch (error: any) {
			logger.error(error.toString());
		}	
	}

	async onStart(ctx: Context) {
		const msg = deunionize(deunionize(ctx.update)?.message)?.text || '';
		if (msg.includes('/start'))
			this.start(ctx);
	}

	initScene() {
		const scene = new Scenes.BaseScene(this.name);
		const meta = this.metaData;
		meta.unshift({
			type: 'hears',
			name: '/start',
			func: this.start
		},
		{
			type: 'command',
			name: 'menu',
			func: this.main
		})
		meta.push({
			type: 'on',
			name: message,
			func: this.onMessage
		});
		for (let item of meta) {
			scene[item.type](item.name, item.func.bind(this));
		}
		scene.enter(this.enter.bind(this));
		return scene;
	}

}

export default BaseScene;