<script setup>
	defineProps(['gm']);
</script>

<template>
<span @click="gm.userActions.surrenderModal()">{{ gm.locale.$surrender }}</span>
</template>

<style scoped>
	span {
		font-family: 'Montserrat', sans-serif;
		font-weight: 500;
		font-size: 18px;
		color: #F98B8B;
		text-decoration: underline;
	}
</style>