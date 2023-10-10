import { createLogger, format, transports} from 'winston';

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logerFormat = format.combine(
	format.timestamp(),
	format.printf(({ timestamp, level, message }) => {
		return `[${timestamp}] ${level}: ${message}`;
	})
);

const logger = createLogger({
	level: level,
	transports: [
		new transports.Console({
			format: format.combine(format.colorize(), logerFormat)
		}),
		new transports.File({
			filename: 'info.log',
			maxsize: 10_000_000,
			level: level
		}),
		new transports.File({
			filename: 'error.log',
			maxsize: 10_000_000,
			level: 'error'
		})
	],
	format: logerFormat
});

export default logger;