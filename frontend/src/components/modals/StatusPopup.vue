<script setup>
	import { computed } from 'vue';

	const props = defineProps(['type', 'text', 'locale']);

	const color = computed(() => {
		switch (props.type) {
			case 'win':
				return '#B77640';
			case 'error':
				return '#936565'
			default:
				return '#656C93'
		}
	});
	const text = computed(() => {
		switch (props.type) {
			case 'win':
				return props.locale.$statusWin;
			case 'error':
				return props.text || props.locale.$statusError;
			case 'lose':
				return props.locale.$statusLose;
			case 'draw':
				return props.locale.$statusDraw;
			default:
				return '#656C93'
		}
	});
</script>
<template>
	<div class="status-popup">
		{{ text }}
	</div>
</template>

<style scoped>
	.status-popup {
		background: v-bind('color');
		border-radius: 12px;
		box-shadow: 4px 6px 4px rgba(0, 0, 0, 0.25);
		text-align: center;
		padding: 5.1%;
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 22px;
		color: #fff;
		position: absolute;
		top: 35.71%;
		left: 0;
		right: 0;
		margin-left: 8px;
		margin-right: 8px;
		z-index: 1500;
	}
</style>