import App from '../application';
import { Context, Markup, NarrowedContext, Scenes, Telegraf, session } from 'telegraf';
const { enter, leave } = Scenes.Stage;
import getScenes from './scenes';
import axios from 'axios';
import logger from '../logger';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import Notifications from './notifications';

class Bot {
	constructor (app: App) {
		this.app = app;
		this.engine = new Telegraf<Scenes.SceneContext>(process.env.TG_TOKEN || '');
		this.notifications = new Notifications(this);
	}
	app: App;
	engine: Telegraf<Scenes.SceneContext>;
	notifications: Notifications;

	initializeScenes() {
		const scenes = [];
		const scenesClasses = getScenes();
		for (const Scene of scenesClasses)
			scenes.push(new Scene(this));
		const allScenes = [];
		for (let scene of scenes) 	
			allScenes.push(scene.initScene());
		const stage = new Scenes.Stage<Scenes.SceneContext>(allScenes, {
			default: 'main',
			ttl: 10000000
		});	
		this.engine.use(session());
		this.engine.use(stage.middleware());
		//this.engine.start(async (ctx:Scenes.SceneContext) =>  {
		//	ctx.scene.enter('main');
		//});
	}

	async start() {
		try {
			this.initializeScenes();
			this.engine.launch();
			this.engine.telegram.setChatMenuButton({menuButton: {type: 'commands'}});
			this.engine.telegram.setMyCommands([{command: '/menu', description: 'Main menu'}]);
			process.once('SIGINT', () => this.engine.stop('SIGINT'));
			process.once('SIGTERM', () => this.engine.stop('SIGTERM'));
			logger.info('Bot is running');
		}
		catch (err: any) {
			logger.error(err.toString());
		}
	};

	async Send(to: number, text: string, markup?: Markup.Markup<InlineKeyboardMarkup>): Promise<number | null> {
		try {
			const message = await this.engine.telegram.sendMessage(to, text, markup);
			return message.message_id;
		} catch (error: any) {
			if (error.code !== 403)
				logger.error(error.toString());
			return null;
		}
	}

	async EditOrReply(ctx: Context, text: string, markup?: Markup.Markup<InlineKeyboardMarkup> | Markup.Markup<ReplyKeyboardMarkup>) {
		try {
			const props :any = {}
			if (markup?.reply_markup)
				props.reply_markup = markup?.reply_markup;
			await ctx.editMessageText(text, props);
		} catch (error: any) {
			logger.error(error.toString());
			try {
				await ctx.reply(text, markup);
			} catch (error: any) {
				logger.error(error.toString());
			}
		}
	}

	async DeleteMessage(userId: number, msgId: number) {
		try {
			await this.engine.telegram.deleteMessage(userId, msgId);
		} catch (error: any) {logger.error(error.toString());}
	}

	async GetProfilePic(id: number): Promise<string> {
		try {
			const photos = await this.engine.telegram.getUserProfilePhotos(id, 0, 1);
			if (photos?.photos && photos.photos.length > 0) {
				const file = await this.engine.telegram.getFileLink(photos.photos[0][0].file_id);
				const response = await axios.get(file.toString(), {responseType: 'arraybuffer'});
				return 'data:image/jpg;base64, ' + Buffer.from(response.data).toString('base64');
			} else 
				return '';
		} catch (error: any) {
			logger.error(error.toString());
			return '';
		}
	}
}

export default Bot;