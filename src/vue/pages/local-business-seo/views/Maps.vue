<template>
	<div class="aioseo-tab-content aioseo-localseo-maps">
		<!-- <local-business-map-measurement-system /> -->

		<local-business-map-default-style />

		<local-business-map-custom-marker />
	</div>
</template>

<script>
export default {
	data () {
		return {
			strings : {	}
		}
	}
}
</script>

<style lang="scss">
.aioseo-localseo-maps {
	.aioseo-input,
	.aioseo-select,
	.aioseo-multiselect {
		max-width: 480px;
	}
	.field-description {
		font-size: 14px;
	}
}
</style>