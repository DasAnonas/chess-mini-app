<script setup>
defineEmits(['surrender', 'cancel']);
defineProps(['locale']);

</script>
<template>
	<div class="surrender-popup">
		<h1>{{ locale.$surrenderWarning }}</h1>
		<div id="buttons">
			<h2 @click="$emit('surrender')" >{{ locale.$surrenderYes }}</h2>
			<h2 id="cancelButton" @click="$emit('cancel')" >{{ locale.$surrenderNo }}</h2>
		</div>
	</div>
</template>

<style scoped>
	.surrender-popup {
		background: #936565;
		border-radius: 12px;
		box-shadow: 4px 6px 4px rgba(0, 0, 0, 0.25);
		text-align: center;
		padding-top: 6.12%;
		padding-bottom: 6.12%;
		padding-left: 12.76%;
		padding-right: 12.76%;
		position: absolute;
		top: 17.71%;
		left:0;
		right:0;
		margin-left: 8px;
		margin-right: 8px;
		z-index: 1500;
	}
	#buttons {
		display: flex;
		text-align: start;
	}
	h1{
		font-family: 'Montserrat', sans-serif;
		font-weight: 500;
		font-size: 18px;
		color: #fff;
		margin: 0;
		padding-bottom: 9.4%;
	}
	h2{
		font-family: 'Montserrat', sans-serif;
		font-weight: 500;
		font-size: 22px;
		color: #fff;
		margin: 0;
	}
	#cancelButton {
		margin-top: auto;
		margin-bottom: auto;
		margin-left: auto;
	}

</style>