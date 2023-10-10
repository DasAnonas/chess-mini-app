<script setup>
	defineProps(['gm']);
</script>

<template>
<div id="status-label">
		<h1>{{ gm.boardState.statusLabel }}</h1>
</div>
</template>

<style scoped>
	h1{
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 20px;
		color: #fff;
		margin: 0;
	}

	#status-label{
		margin-bottom: 1.5%;
		display: flex;
	}
</style>