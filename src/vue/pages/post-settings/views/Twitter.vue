<template>
	<div class="tab-twitter">
		<core-settings-row
			:name="strings.twitterPreview"
		>
			<template #content>
				<core-twitter-preview
					:image="currentPost.twitter_use_og ? (currentPost.og_image_custom_url || currentPost.og_image) : (currentPost.twitter_image_custom_url || currentPost.twitter_image)"
					:card="currentPost.twitter_card"
					:class="{ ismobilecard: currentPost.socialMobilePreview }"
				>
					<template #site-title>
						<span>{{ previewTitle }}</span>
					</template>

					<template #site-description>
						<span>{{ previewDescription }}</span>
					</template>
				</core-twitter-preview>
			</template>
		</core-settings-row>

		<core-settings-row
			:name="strings.useFB"
			leftSize=5
			rightSize=7
			class="use-facebook"
		>
			<template #content>
				<base-toggle
					v-model="currentPost.twitter_use_og"
					@input="setIsDirty"
				/>
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="!currentPost.twitter_use_og"
			:name="strings.twitterTitle"
			class="twitter-title-settings"
			align
		>
			<template #content>
				<core-html-tags-editor
					class="twitter-meta-input"
					v-model="currentPost.twitter_title"
					:line-numbers="false"
					single
					@counter="count => updateCount(count, 'titleCount')"
					@input="setIsDirty"
					:tags-context="`${currentPost.postType || currentPost.termType}Title`"
					:default-tags="$tags.getDefaultTags('term' === currentPost.context ? 'taxonomies' : null, null, 'title')"
				>
				</core-html-tags-editor>

				<div
					class="max-recommended-count"
					v-html="maxRecommendedCount(titleCount, 70)"
				/>
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="!currentPost.twitter_use_og"
			:name="strings.twitterDescription"
			class="twitter-description-settings"
			align
		>
			<template #content>
				<core-html-tags-editor
					class="twitter-meta-input"
					v-model="currentPost.twitter_description"
					:line-numbers="false"
					description
					@counter="count => updateCount(count, 'descriptionCount')"
					@input="setIsDirty"
					:tags-context="`${currentPost.postType || currentPost.termType}Description`"
					:default-tags="$tags.getDefaultTags('term' === currentPost.context ? 'taxonomies' : null, null, 'description')"
				>
					<template #tags-description>
						{{ strings.clickToAddHomePageDescription }}
					</template>
				</core-html-tags-editor>

				<div
					class="max-recommended-count"
					v-html="maxRecommendedCount(descriptionCount, 200)"
				/>
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="!currentPost.twitter_use_og"
			class="twitter-image-source"
			:name="strings.imageSource"
			leftSize=5
			rightSize=7
			align
		>
			<template #content>
				<base-select
					size="medium"
					:options="imageSourceOptionsFiltered"
					:value="getImageSourceOptionFiltered(currentPost.twitter_image_type)"
					@input="value => saveTwitterImageType(value.value)"
				/>
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="!currentPost.twitter_use_og && 'custom' === currentPost.twitter_image_type"
			class="twitter-custom-field"
			:name="strings.customFieldsName"
			leftSize=5
			rightSize=7
			align
		>
			<template #content>
				<base-input
					type="text"
					size="medium"
					:placeholder="strings.placeholder"
					v-model="currentPost.twitter_image_custom_fields"
					@input="setIsDirty"
				/>
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="!currentPost.twitter_use_og && 'custom_image' === currentPost.twitter_image_type"
			class="twitter-image"
			:name="strings.twitterImage"
		>
			<template #content>
				<div class="twitter-image-upload">
					<base-input
						size="medium"
						v-model="currentPost.twitter_image_custom_url"
						@input="setIsDirty"
						:placeholder="strings.pasteYourImageUrl"
					/>
					<base-button
						class="insert-image"
						@click="openUploadModal('twitterImage', ['currentPost', 'twitter_image_custom_url'])"
						size="medium"
						type="black"
					>
						<svg-circle-plus />
						{{ strings.uploadOrSelectImage }}
					</base-button>

					<base-button
						class="remove-image"
						@click="currentPost.twitter_image_custom_url = null"
						size="medium"
						type="gray"
					>
						{{ strings.remove }}
					</base-button>
				</div>

				<div class="aioseo-description">
					<span v-if="'summary' === currentPost.twitter_card">{{ strings.minimumSizeSummary }}</span>
					<span v-if="'summary_large_image' === currentPost.twitter_card">{{ strings.minimumSizeSummaryWithLarge }}</span>
				</div>

				<base-img :src="currentPost.twitter_image_custom_url" />
			</template>
		</core-settings-row>

		<core-settings-row
			class="twitter-card-type"
			:name="strings.twitterCardType"
			leftSize=5
			rightSize=7
			align
		>
			<template #content>
				<base-select
					size="medium"
					open-direction="top"
					:options="twitterCards"
					:value="getCardOptions(currentPost.twitter_card)"
					@input="value => cardSelect(value.value)"
				/>
			</template>
		</core-settings-row>

	</div>
</template>

<script>
import { ImageSourceOptions, MaxCounts, Tags, Uploader, IsDirty } from '@/vue/mixins'
import { mapState } from 'vuex'
export default {
	mixins : [ ImageSourceOptions, MaxCounts, Tags, Uploader, IsDirty ],
	props  : {
		isMobilePreview : {
			type : Boolean,
			default () {
				return false
			}
		}
	},
	data () {
		return {
			titleCount       : 0,
			descriptionCount : 0,
			strings          : {
				twitterPreview              : this.$t.__('Twitter Preview', this.$td),
				useFB                       : this.$t.__('Use Data from Facebook Tab', this.$td),
				imageSource                 : this.$t.__('Image Source', this.$td),
				customFieldsName            : this.$t.__('Custom Field Name', this.$td),
				twitterImage                : this.$t.__('Twitter Image', this.$td),
				twitterTitle                : this.$t.__('Twitter Title', this.$td),
				twitterDescription          : this.$t.__('Twitter Description', this.$td),
				twitterCardType             : this.$t.__('Twitter Card Type', this.$td),
				pasteYourImageUrl           : this.$t.__('Paste your image URL or select a new image', this.$td),
				uploadOrSelectImage         : this.$t.__('Upload or Select Image', this.$td),
				remove                      : this.$t.__('Remove', this.$td),
				minimumSizeSummary          : this.$t.__('Minimum size: 144px x 144px, ideal ratio 1:1, 5MB max. JPG, PNG, WEBP and GIF formats only.', this.$td),
				minimumSizeSummaryWithLarge : this.$t.__('Minimum size: 300px x 157px, ideal ratio 2:1, 5MB max. JPG, PNG, WEBP and GIF formats only.', this.$td)

			}
		}
	},
	computed : {
		...mapState([ 'currentPost', 'options' ]),
		twitterCards () {
			return [
				{ label: this.$t.__('Default (Set under Social Networks)', this.$td), value: 'default' },
				{ label: this.$t.__('Summary', this.$td), value: 'summary' },
				{ label: this.$t.__('Summary with Large Image', this.$td), value: 'summary_large_image' }
			]
		},
		previewTitle () {
			const title = this.currentPost.twitter_use_og ? this.currentPost.og_title : this.currentPost.twitter_title
			return this.truncate(this.parseTags(title || this.currentPost.tags.title || '#post_title #separator_sa #site_title'), 100)
		},
		previewDescription () {
			const description = this.currentPost.twitter_use_og ? this.currentPost.og_description : this.currentPost.twitter_description
			return this.truncate(this.parseTags(description || this.currentPost.tags.description || '#post_content'))
		}
	},
	methods : {
		getCardOptions (option) {
			return this.twitterCards.find(t => t.value === option)
		},
		cardSelect (option) {
			this.$set(this.currentPost, 'twitter_card', option)
			this.$store.commit('isDirty', true)
		},
		scrollToElement () {
			const container = document.getElementsByClassName('component-wrapper')[0]
			setTimeout(() => {
				if (container) {
					container.firstChild.scrollTop = 0
				}
			}, 10)
		},
		saveTwitterImageType (value) {
			this.$set(this.currentPost, 'twitter_image_type', value)
			this.$store.commit('isDirty', true)
		}
	},
	mounted () {
		this.scrollToElement()
	}
}
</script>

<style lang="scss">
.tab-twitter {
	.twitter-image-upload {
		display: flex;

		.aioseo-input {
			max-width: 445px;
			margin-right: 10px;
		}

		.insert-image {
			min-width: 214px;
			margin-right: 10px;

			svg.aioseo-circle-plus {
				width: 13px;
				height: 13px;
				margin-right: 10px;
			}
		}
	}

	// .twitter-image-source, .twitter-card-type {
	//  .aioseo-select {
	//      max-width: 400px;
	//  }
	// }

	.twitter-image {
		img {
			margin-top: 20px;
			width: auto;
			max-width: 525px;
			max-height: 525px;
			height: auto;
		}

		&.vertical {
			img {
				max-width: 158px;
				max-height: 158px;
			}
		}
	}

	.twitter-image-source,
	.twitter-custom-field {
		padding-top: 8px !important;
		padding-bottom: 24px !important;
	}

	.twitter-image,
	.twitter-card-type {
		padding-top: 8px !important;
	}

	.use-facebook {
		margin-bottom: 32px !important;
		padding-bottom: 32px !important;
	}

	.aioseo-settings-row:last-of-type {
		margin-bottom: 32px !important;
		padding-bottom: 32px !important;
	}
}
</style>