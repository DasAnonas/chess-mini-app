import App from './application';
import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

(async () => {
	logger.info('Starting App')
	const app = new App();
	await app.prepare();
	await app.start(8080);
})();