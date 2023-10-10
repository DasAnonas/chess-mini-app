<script setup>
	import StatusPopup from '@/components/modals/StatusPopup.vue';
	import SurrenderPopup from '@/components/modals/SurrenderPopup.vue';
	import OpponentLayout from '@/components/layouts/OpponentLayout.vue';
	import StatusBarLayout from '@/components/layouts/StatusBarLayout.vue';
	import SurrenderButton from '@/components/buttons/SurrenderButton.vue';
	import GameMaster  from '@/game/gameMaster.js'
	import {onMounted, nextTick } from 'vue';
	import { useRoute } from 'vue-router';
	
	const route = useRoute();
	const gm = new GameMaster(route.query.id, route.query.isSingle);

	async function setWidth() {
		const ratio = window.innerWidth / window.innerHeight;
		let coeff = 1;
		if (ratio > 0.75)
			coeff = 0.75 / ratio;
		gm.boardState.board.width = window.innerWidth * (100-2*parseFloat(gm.boardState.board.dimensions.pY)) / 100 * coeff - 16;
		await nextTick();
		gm.initBoard();
	}

	function setObservers() {
		setWidth();
		new ResizeObserver(setWidth).observe(document.getElementById('board-wrap'))
		window.addEventListener("resize", setWidth);
		document.addEventListener("touchstart", function(){}, true);
	}

	onMounted(() => {
		setObservers();
		window.Telegram.WebApp.expand();
		window.Telegram.WebApp.setBackgroundColor('#7D6B5A');
		gm.initBoard();
		gm.ws.connect();
		if (route.query.isSingle) 
			gm.userActions.startGame();
		gm.checkQueue();	
	});

</script>

<template>
	<OpponentLayout :gm="gm" />
	<StatusBarLayout :gm="gm" />
	<div class="mb" id="board-wrap">
		<StatusPopup v-if="gm.boardState.popup.show" :type="gm.boardState.popup.type" :text="gm.boardState.popup.text" :locale="gm.locale" class="rotation-popup"/>
		<SurrenderPopup v-if="!gm.boardState.popup.show && gm.boardState.showSurrender" :locale="gm.locale"
			@surrender="gm.userActions.surrender()"
			@cancel="gm.boardState.showSurrender = false;" class="rotation-popup"/>
		<div id="chessBoard"></div>
	</div>
	<div class="mb" v-if="gm.boardState.isWhite !== undefined">
		<SurrenderButton :gm="gm" />
	</div>
	
</template>

<style>
	#board-wrap {
		position: relative;
	}
	#chessBoard{
		width: v-bind('`${gm.boardState.board.width}px`');
		margin-left: auto;
		margin-right: auto;
		
	}
	div[class*="board-container"] {
		border-radius: 15px;
		overflow: hidden;
		border: solid 4px #DFB97F !important;
	}
	div[class*="white"] {
		background-color: #FDF1E7 !important;
	}
	div[class*="black"] {
		background-color: #EEC485 !important;
	}
	div[class*="circle"] {
		background-color: #3AB1E4 !important;
	}
	.mb {
		margin-bottom: 6.69%;
		text-align: center;
	}
</style>
