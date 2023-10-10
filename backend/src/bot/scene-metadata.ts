class SceneMetadata {
	constructor(type: string, name: string, func: Function) {
		this.type = type;
		this.name = name;
		this.func = func;
	}
	type: string;
	name: string | Function | RegExp;
	func: Function;
}

export default SceneMetadata;