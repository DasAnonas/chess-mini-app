import fs from 'fs';
import path from 'path'


const loadScenes = function(dir: string, commands: Array<any>) {
	const files = fs.readdirSync(dir);
	files.forEach(file => {
		if (file !== 'index.js') {
			const p = path.resolve(dir, file);
			const stat = fs.statSync(p);
			if (stat && stat.isDirectory()) {
				return loadScenes(p, commands);
			} else {
				const commandClass = require(p);
				commands.push(commandClass);
			}
		}
	});
};

export default function () {
	const commands: Array<any> = [];
	loadScenes(__dirname, commands);
	return commands;
};