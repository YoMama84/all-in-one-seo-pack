<template>
	<div
		class="aioseo-card"
		:class="{
			'disabled' : disabled
		}"
	>
		<div
			v-if="!hideHeader"
			class="header"
		>
			<div class="text">
				<div class="header-icon">
					<slot name="header-icon" />
				</div>

				<slot name="header">
					{{ headerText }}
				</slot>

				<core-tooltip
					v-if="$slots.tooltip"
				>
					<svg-circle-question-mark />

					<template #tooltip>
						<slot name="tooltip" />
					</template>
				</core-tooltip>
			</div>

			<svg-caret
				@click="toggleCard({ slug, shouldSave : saveToggleStatus })"
				v-if="!closes && toggles && settings.toggledCards && !noSlide && !disabled"
				:class="{ rotated: !settings.toggledCards[slug] }"
			/>

			<svg-close
				@click="$emit('close-card', true)"
				v-if="closes"
			/>
		</div>

		<div v-if="$slots['disabled'] && disabled" class="content">
			<slot name="disabled" />
		</div>

		<transition-slide
			v-if="(settings.toggledCards || noSlide) && !disabled"
			:active="(settings.toggledCards[slug] && toggles) || noSlide"
		>
			<div
				v-if="$slots['before-tabs']"
				class="content"
			>
				<slot name="before-tabs" />
			</div>

			<slot name="tabs" />

			<div
				v-if="$slots.default"
				class="content"
			>
				<slot />
			</div>
		</transition-slide>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
	props : {
		slug : {
			type     : String,
			required : true
		},
		headerText : String,
		toggles    : {
			type : Boolean,
			default () {
				return true
			}
		},
		hideHeader       : Boolean,
		noSlide          : Boolean,
		closes           : Boolean,
		saveToggleStatus : {
			type : Boolean,
			default () {
				return true
			}
		},
		disabled : Boolean
	},
	watch : {
		toggles (value) {
			const slug = this.slug
			if (value && !this.settings.toggledCards[slug]) {
				this.toggleCard({ slug, shouldSave: true })
			}
		}
	},
	computed : {
		...mapGetters([ 'settings' ])
	},
	methods : {
		...mapActions([ 'toggleCard' ])
	}
}
</script>

<style lang="scss">
.aioseo-card {
	color: $black;
	background-color: #fff;
	border: 1px solid $border;
	box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
	margin: 30px 0;

	&.disabled {
		.content {
			background: $box-background;
			font-size: 16px;
			line-height: 24px;
		}
	}

	@media only screen and (max-width: 782px) {
		margin: 20px 0;
	}

	svg.aioseo-circle-question-mark {
		width: 17px;
		height: 17px;
		color: #8C8F99;
		transition: background-color 0.2s ease;

		&:hover {
			color: darken(#8C8F99, 20%);
		}
	}

	.header {
		display: flex;
		align-items: center;
		height: 70px;
		padding: 0 30px;
		font-weight: 600;
		font-size: 18px;
		border-bottom: 1px solid $border;

		.header-icon {
			display: flex;

			svg {
				width: 24px;
				height: 24px;
				margin-right: 16px;
			}
		}

		.text {
			flex: 1 0 auto;
			display: flex;
			align-items: center;

			svg.aioseo-circle-question-mark {
				cursor: pointer;
				width: 17px;
				height: 17px;
			}

			.aioseo-pro-badge {
				margin-left: 10px;
			}

			.card-score {
				display: flex;
				flex: 1;
				align-items: center;
				justify-content: flex-end;
				padding-right: 18px;
				font-size: 13px;
				&.green {
					color: $green;
				}
				&.orange {
					color: $orange;
				}
				&.red {
					color: $red;
				}
				svg {
					margin-right: 7px;
				}
			}
		}

		svg.aioseo-caret {
			width: 24px;
			height: 24px;
			cursor: pointer;
			transform: rotate(-180deg);
			transition: transform 0.3s;

			&.rotated {
				transform: rotate(-90deg);
			}
		}

		svg.aioseo-close {
			width: 14px;
			height: 14px;
			cursor: pointer;
		}
	}

	.content {
		padding: 30px;
		position: relative;
	}

	div.aioseo-settings-row:last-child {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: 0;
	}
}
</style>