<script setup>
	import SoundButton from '@/components/buttons/SoundButton.vue';
	defineProps(['gm']);
</script>

<template>
<div id="opponent" :style="{visibility: gm.boardState.opponent.name?.length > 0 || true ? 'visible' : 'hidden', display: 'flex',}">
	<div style="flex: 1"></div>
	<div style="flex: 6;">
		<img id="avatar" :src="gm.boardState.opponent.avatar">
		<h5>{{ '@' +  gm.boardState.opponent.name }}</h5>
	</div>
	<div style="flex: 1">
			<SoundButton :isOn="gm.soundEngine.isSoundOn" @click="gm.userActions.switchSound()"/>
	</div>
</div>
</template>

<style scoped>
	svg {
		position: absolute;
	}	
	#opponent {
		width: 100%;
		margin-top: 12px;
		text-align: center;
	}
	img {
		border-radius: 1024px;
		width: 11.49%;
	}
	h5{
		font-family: 'Montserrat', sans-serif;
		font-weight: 500;
		font-size: 12px;
		color: #fff;
		margin: 0;
	}
</style>