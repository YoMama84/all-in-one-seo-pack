<template>
	<div class="aioseo-feature-manager">
		<div class="aioseo-feature-manager-header">
			<div class="buttons" v-if="getAddons.filter(addon => addon.canActivate === true).length > 0">
				<div class="button-content">
					<base-button
						size="medium"
						type="blue"
						:loading="loading.activateAll"
						@click="activateAllFeatures"
					>{{ strings.activateAllFeatures }}</base-button>
					<base-button
						v-if="!isUnlicensed"
						size="medium"
						type="gray"
						:loading="loading.deactivateAll"
						@click="deactivateAllFeatures"
					>{{ strings.deactivateAllFeatures }}</base-button>
				</div>
			</div>
			<div class="search">
				<base-input
					v-model="search"
					size="medium"
					:placeholder="strings.searchForFeatures"
					prepend-icon="search"
				/>
			</div>
		</div>

		<div class="aioseo-feature-manager-addons">
			<core-alert
				v-if="isUnlicensed"
				type="red"
			>
				<strong>{{ yourLicenseIsText }}</strong>
				{{ strings.aValidLicenseIsRequired }}

				<div class="buttons">
					<base-button
						type="blue"
						size="small"
						tag="a"
						:href="$aioseo.urls.aio.settings"
					>
						{{ strings.enterLicenseKey }}
					</base-button>

					<base-button
						type="green"
						size="small"
						tag="a"
						target="_blank"
						:href="$links.getUpsellUrl('feature-manager-upgrade', 'no-license-key', 'pricing')"
					>
						{{ strings.purchaseLicense }}
					</base-button>
				</div>
			</core-alert>

			<grid-row>
				<grid-column
					v-for="(addon, index) in getAddons"
					:key="index"
					sm="6"
					lg="4"
				>
					<core-feature-card
						ref="addons"
						:can-activate="addon.canActivate"
						:can-manage="$allowed(addon.capability)"
						:feature="addon"
					>
						<template #title>
							<!--
								This allows us to pass in one of our svg components built into the plugin,
								i.e. `svg-sitemaps-pro`
								or we can send in a base64 encoded svg as well,
								or we can pass in an image URL.
							-->
							<component
								:is="getIconComponent(addon.icon)"
								:src="getIconSrc(addon.icon, addon.image)"
							/>
							{{ addon.name }}
						</template>

						<template #description>
							<div v-html="getAddonDescription(addon)" />
						</template>
					</core-feature-card>
				</grid-column>
			</grid-row>
		</div>

		<cta
			v-if="isUnlicensed"
			class="feature-manager-upsell"
			:type="2"
			:button-text="strings.ctaButtonText"
			:floating="false"
			:cta-link="$links.utmUrl('feature-manager', 'main-cta')"
			:learn-more-link="$links.getUpsellUrl('feature-manager', 'main-cta', 'home')"
			:feature-list="[
				strings.videoNewsSitemaps,
				strings.imageSeoOptimization,
				strings.localBusinessSeo,
				strings.advancedWooCommerce,
				strings.customTaxonomies,
				strings.andMore
			]"
		>
			<template #header-text>
				<span class="large">{{ strings.ctaHeaderText }}</span>
			</template>

			<template #description>
				{{ upgradeToday }}
			</template>

			<template #featured-image>
				<img src="@/vue/assets/images/upsells/news-sitemap.png" />
			</template>
		</cta>
	</div>
</template>

<script>
import { License } from '@/vue/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
	mixins : [ License ],
	data () {
		return {
			search  : null,
			loading : {
				activateAll   : false,
				deactivateAll : false
			},
			strings : {
				videoNewsSitemaps       : this.$t.__('Video and News Sitemaps', this.$td),
				imageSeoOptimization    : this.$t.__('Image SEO Optimization', this.$td),
				localBusinessSeo        : this.$t.__('Local Business SEO', this.$td),
				advancedWooCommerce     : this.$t.__('Advanced WooCommerce', this.$td),
				customTaxonomies        : this.$t.__('SEO for Categories, Tags and Custom Taxonomies', this.$td),
				andMore                 : this.$t.__('And many more...', this.$td),
				activateAllFeatures     : this.$t.__('Activate All Features', this.$td),
				deactivateAllFeatures   : this.$t.__('Deactivate All Features', this.$td),
				searchForFeatures       : this.$t.__('Search for Features...', this.$td),
				// Translators: 1 - The plugin name ("All in One SEO").
				ctaHeaderText           : this.$t.sprintf(this.$t.__('Upgrade %1$s to Pro and Unlock all Features!', this.$td), process.env.VUE_APP_SHORT_NAME),
				ctaButtonText           : this.$t.__('Upgrade to Pro and Unlock All Features', this.$td),
				aValidLicenseIsRequired : this.$t.__('A valid license key is required in order to use our addons.', this.$td),
				enterLicenseKey         : this.$t.__('Enter License Key', this.$td),
				purchaseLicense         : this.$t.__('Purchase License', this.$td)
			},
			descriptions : {
				aioseoImageSeo : {
					description : this.$t.__('Globally control the Title attribute and Alt text for images in your content. These attributes are essential for both accessibility and SEO.', this.$td),
					version     : 0
				},
				aioseoVideoSitemap : {
					description : this.$t.__('The Video Sitemap works in much the same way as the XML Sitemap module, it generates an XML Sitemap specifically for video content on your site. Search engines use this information to display rich snippet information in search results.', this.$td),
					version     : 0
				},
				aioseoNewsSitemap : {
					description : this.$t.__('Our Google News Sitemap lets you control which content you submit to Google News and only contains articles that were published in the last 48 hours. In order to submit a News Sitemap to Google, you must have added your site to Google’s Publisher Center and had it approved.', this.$td),
					version     : 0
				},
				aioseoLocalBusiness : {
					description : this.$t.__('Local Business schema markup enables you to tell Google about your business, including your business name, address and phone number, opening hours and price range. This information may be displayed as a Knowledge Graph card or business carousel.', this.$td),
					version     : 0
				}
			}
		}
	},
	computed : {
		...mapGetters([ 'isUnlicensed' ]),
		...mapState([ 'addons' ]),
		upgradeToday () {
			// Translators: 1 - Plugin short name ("AIOSEO"), 2 "Pro".
			return this.$t.sprintf(this.$t.__('%1$s %2$s comes with many additional features to help take your site\'s SEO to the next level!', this.$td), process.env.VUE_APP_SHORT_NAME, 'Pro')
		},
		getAddons () {
			return this.addons
				.filter(addon => !this.search || addon.name.toLowerCase().includes(this.search.toLowerCase()))
		}
	},
	methods : {
		...mapActions([ 'installPlugins', 'deactivatePlugins' ]),
		getIconComponent (icon) {
			return icon.startsWith('svg-') ? icon : 'img'
		},
		getIconSrc (icon, image) {
			return 'string' === typeof icon && icon.startsWith('svg-')
				? null
				: (
					'string' === typeof icon
						? `data:image/svg+xml;base64,${icon}`
						: image
				)
		},
		getAddonDescription (addon) {
			const camelizedName = addon.sku.replace(/-./g, x => x.toUpperCase()[1])
			if (this.descriptions[camelizedName] && this.descriptions[camelizedName].description && addon.descriptionVersion <= this.descriptions[camelizedName].version) {
				return this.descriptions[camelizedName].description
			}
			return addon.description
		},
		activateAllFeatures () {
			// First, check to see if this user is licensed and has an active license.
			// If not, we want to redirect the user to a new page with an upsell.
			if (!this.$isPro || !this.$aioseo.license.isActive) {
				return window.open(this.$links.utmUrl('activate-all-features'))
			}

			this.loading.activateAll = true
			const addons = this.addons
				.filter(addon => !addon.requiresUpgrade)
				.map(addon => ({
					plugin : addon.basename
				}))
			this.installPlugins(addons)
				.then(response => {
					const completed = Object.keys(response.body.completed).map(k => response.body.completed[k])
					this.$refs.addons.forEach(component => {
						if (completed.includes(component.feature.basename)) {
							component.activated = true
						}
					})
					this.loading.activateAll = false
				})
		},
		deactivateAllFeatures () {
			this.loading.deactivateAll = true
			const addons = this.addons
				.filter(addon => !addon.requiresUpgrade)
				.filter(addon => addon.installed)
				.map(addon => ({
					plugin : addon.basename
				}))
			this.deactivatePlugins(addons)
				.then(response => {
					const completed = Object.keys(response.body.completed).map(k => response.body.completed[k])
					this.$refs.addons.forEach(component => {
						if (completed.includes(component.feature.basename)) {
							component.activated = false
						}
					})
					this.loading.deactivateAll = false
				})
		}
	}
}
</script>

<style lang="scss">
.aioseo-feature-manager {
	.aioseo-alert {
		margin-bottom: 30px;

		&.install-failed {
			margin-top: 30px;
			margin-bottom: 0;
		}

		.buttons {
			margin-top: 10px;

			.aioseo-button:not(:last-child) {
				margin-right: 10px;
			}
		}
	}

	.aioseo-feature-manager-header {
		padding: 20px 0 10px;
		border-bottom: 2px solid $border;
		margin: 0 0 30px;
		display: flex;
		align-items: center;

		.buttons {
			flex: 1 0;

			.aioseo-button {
				margin-right: 10px;
			}
		}

		.aioseo-input {
			max-width: 325px;
		}
	}

	.feature-manager-upsell {
		margin-top: 50px;
	}
}
</style>