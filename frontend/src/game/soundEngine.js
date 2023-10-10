import {Howl} from 'howler';

class SoundEngine {
	constructor () {
		this.alert = new Howl({
			src: [`/sounds/alert.wav`],
			preload: true,
			html5: true
		});
		this.move = new Howl({
			src: [`/sounds/move.wav`],
			preload: true,
			html5: true
		});
		this.select = new Howl({
			src: [`/sounds/select.wav`],
			preload: true,
			html5: true
		});
		this.isSoundOn = true;
	}

	Select() {
		window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
		if (this.isSoundOn)
			this.select.play();
	}

	Move() {
		window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
		if (this.isSoundOn)
			this.move.play();
	}

	NotifyMove() {
		window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
		if (this.isSoundOn)
			this.alert.play();
	}

}

export default SoundEngine;