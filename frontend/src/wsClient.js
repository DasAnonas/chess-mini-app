class WsClient {
	constructor (options, callbacks) {
		this.client = {};
		this.options = options;
		this.messageQueue = [];
		this.openCallback = callbacks.openCallback || (() => {});
		this.messageCallback = callbacks.messageCallback || (() => {});
		this.closeCallback = callbacks.closeCallback || (() => {});
		this.errorCallback = callbacks.errorCallback || (() => {});
		this.isGameOver = false;
	}

	connect () {
		if (!this.isGameOver) {
			this.client = new WebSocket(this.options.url);
			console.log(this.client);
			this.client.onopen = this.onopen.bind(this);
			this.client.onmessage = this.onmessage.bind(this);
			this.client.onclose = this.onclose.bind(this);
			this.client.onerror = this.onerror.bind(this);
		}
	}

	onopen () {
		console.log('connected');
		this.client.send(JSON.stringify({
			action: 'join',
			gameId: this.options.gameId,
			userId: this.options.userId,
			tgName: this.options.tgName,
			hash: this.options.hash,
			string: this.options.securitycheckDataString,
		}));
		this.ping = setInterval(this.sendPing.bind(this), 30000);
		this.openCallback();
	}

	onmessage(event) {
		if (event && event.data) {
			console.log(event.data);
			const data = JSON.parse(event.data);
			this.messageQueue.push(data);
			this.messageCallback(data);
		}
	}

	onclose(event) {
		console.log('Socket close', event);
		this.closeCallback(event);
		if (this.ping)
			clearInterval(this.ping);
		this.resetPingTimeout();
		if (!this.isGameOver)
			setTimeout(() => {
				this.connect();
			}, 3000);

	}

	onerror(event) {
		console.log('Socket error', event);
		this.errorCallback(event);
	}

	send(data) {
		this.client.send(JSON.stringify(Object.assign({
			gameId: this.options.gameId,
			userId: this.options.userId,
		}, data)));
	}

	sendPing() {
		console.log('send ping');
		this.client.send(JSON.stringify({action: 'ping', gameId: this.options.gameId}));
		this.setPingTimeout();
	}

	setPingTimeout() {
		this.resetPingTimeout();
		this.pingTimeout = setInterval(() => this.client.close(1000, 'request timeout'), 10000);
	}

	resetPingTimeout() {
		console.log('reset timeout');
		if (this.pingTimeout)
			clearTimeout(this.pingTimeout);
	}
}

export default WsClient;