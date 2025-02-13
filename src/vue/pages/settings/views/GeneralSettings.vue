<template>
	<div class="aioseo-general-settings">
		<core-getting-started
			v-if="settings.showSetupWizard && $allowed('aioseo_setup_wizard')"
		/>

		<core-card
			slug="license"
			:header-text="strings.license"
		>
			<template
				v-if="!$isPro"
				#tooltip
			>
				<div v-html="tooltipText" />
				<br>
				<div v-html="moreToolTipText" class="more-tooltip-text" />
			</template>

			<settings-license-key />

			<core-settings-row
				:name="strings.setupWizard"
				v-if="!settings.showSetupWizard && $allowed('aioseo_setup_wizard')"
			>
				<template #content>
					<base-button
						type="blue"
						size="medium"
						tag="a"
						:href="$aioseo.urls.aio.wizard"
					>
						<svg-rocket /> {{ strings.relaunchSetupWizard }}
					</base-button>

					<p class="aioseo-description">{{ strings.setupWizardText }}</p>
				</template>
			</core-settings-row>
		</core-card>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	data () {
		return {
			strings : {
				license           : this.$t.__('License', this.$td),
				boldText          : this.$t.sprintf('<strong>%1$s %2$s</strong>', process.env.VUE_APP_NAME, this.$t.__('Free', this.$td)),
				purchasedBoldText : this.$t.sprintf('<strong>%1$s %2$s</strong>', process.env.VUE_APP_NAME, this.$t.__('Pro', this.$td)),
				// Translators: 1 - "Pro".
				linkText          : this.$t.sprintf(this.$t.__('upgrading to %1$s', this.$td), 'Pro'),
				moreBoldText      : this.$t.sprintf(
					'<strong>%1$s</strong>',
					// Translators: This refers to a discount ("As a valued user you receive 50%, automatically applied at checkout!").
					'50% ' + this.$t.__('off', this.$td)
				),
				setupWizard         : this.$t.__('Setup Wizard', this.$td),
				relaunchSetupWizard : this.$t.__('Relaunch Setup Wizard', this.$td),
				// Translators: 1 - The plugin name ("All in One SEO")
				setupWizardText     : this.$t.sprintf(this.$t.__('Use our configuration wizard to properly set up %1$s with your WordPress website.', this.$td), process.env.VUE_APP_NAME)
			}
		}
	},
	computed : {
		...mapGetters([ 'settings' ]),
		link () {
			return this.$t.sprintf('<strong><a href="%1$s" target="_blank">%2$s</a></strong>', this.$links.utmUrl('general-settings', 'license-box-tooltip'), this.strings.linkText)
		},
		tooltipText () {
			// Translators: 1 - "upgrading to Pro".
			return this.$t.sprintf(this.$t.__('To unlock more features, consider %1$s.', this.$td), this.link)
		},
		moreToolTipText () {
			// Translators: 1 - "50% off".
			return this.$t.sprintf(this.$t.__('As a valued user you receive %1$s, automatically applied at checkout!', this.$td), this.strings.moreBoldText)
		}
	}
}
</script>

<style lang="scss">
.aioseo-general-settings {
	.wizard-actions .aioseo-button {
		text-align: center;
	}
	.more-tooltip-text strong {
		color: $green;
	}

	svg.aioseo-setup-wizard {
		width: 12px;
		height: 12px;
		margin-right: 10px;
	}
}
</style>