<template>
	<div
		class="aioseo-meta-options"
		:class="{
			editing: showEditTitle || showEditDescription || showEditImageTitle || showEditImageAltTag
		}"
	>
		<div>
			<div
				v-if="'edit' === this.$root._data.screen.base && !isWooCommerceProduct && showTruSeo && this.$allowed('aioseo_page_analysis') && !isSpecialPage"
				class="edit-row"
			>
				<core-score-button
					:score="this.post.value"
					:postId="postId"
				/>
			</div>
			<div
				v-if="this.$allowed('aioseo_page_general_settings')"
				class="edit-row edit-title"
			>
				<a
					class="dashicons dashicons-edit aioseo-quickedit"
					:title="strings.edit"
					@click.prevent="editTitle"
				>
				</a>
				<strong>{{ strings.title }} </strong>
				<span
					:id="`aioseo-${columnName}-${postId}-value`"
					v-html="truncate(titleParsed, 100)"
				/>
			</div>
			<div
				v-if="showEditTitle"
				class="edit-row"
			>
				<textarea
					v-model="title"
					class="aioseo-quickedit-input"
					rows="4"
					columns="32"
				/>
				<a
					class="dashicons aioseo-quickedit-input-save"
					@click.prevent="save"
					:title="strings.save"
				>
					<svg-circle-check width="20" />
				</a>
				<a
					class="dashicons aioseo-quickedit-input-cancel"
					@click.prevent="cancel"
					:title="strings.cancel"
				>
					<svg-circle-close width="20" />
				</a>
			</div>

			<div
				v-if="this.$allowed('aioseo_page_general_settings')"
				class="edit-row edit-description"
			>
				<a
					class="dashicons dashicons-edit aioseo-quickedit"
					:title="strings.edit"
					@click.prevent="editDescription"
				>
				</a>
				<strong>{{ strings.description }} </strong>
				<span
					:id="`aioseo-${columnName}-${postId}-value`"
					v-html="truncate(descriptionParsed)"
				/>
			</div>
			<div
				v-if="showEditDescription"
				class="edit-row"
			>
				<textarea
					v-model="postDescription"
					class="aioseo-quickedit-input"
					rows="4"
					columns="32"
				/>
				<a
					class="dashicons aioseo-quickedit-input-save"
					@click.prevent="save"
					:title="strings.save"
				>
					<svg-circle-check width="20" />
				</a>
				<a
					class="dashicons aioseo-quickedit-input-cancel"
					@click.prevent="cancel"
					:title="strings.cancel"
				>
					<svg-circle-close width="20" />
				</a>
			</div>

			<div
				v-if="'upload' === this.$root._data.screen.base && post.showMedia"
				class="edit-row edit-image-title"
			>
				<a
					class="dashicons dashicons-edit aioseo-quickedit"
					:title="strings.edit"
					@click.prevent="editImageTitle"
				>
				</a>
				<strong>{{ strings.imageTitle }} </strong>
				<span
					:id="`aioseo-${columnName}-${postId}-value`"
					v-html="imageTitle"
				/>
			</div>
			<div
				v-if="showEditImageTitle"
				class="edit-row"
			>
				<textarea
					v-model="imageTitle"
					class="aioseo-quickedit-input"
					rows="4"
					columns="32"
				/>
				<a
					class="dashicons aioseo-quickedit-input-save"
					@click.prevent="saveImage"
					:title="strings.save"
				>
					<svg-circle-check width="20" />
				</a>
				<a
					class="dashicons aioseo-quickedit-input-cancel"
					@click.prevent="cancel"
					:title="strings.cancel"
				>
					<svg-circle-close width="20" />
				</a>
			</div>

			<div
				v-if="'upload' === this.$root._data.screen.base && post.showMedia"
				class="edit-row edit-image-alt"
			>
				<a
					class="dashicons dashicons-edit aioseo-quickedit"
					:title="strings.edit"
					@click.prevent="editImageAlt"
				>
				</a>
				<strong>{{ strings.imageAltTag }} </strong>
				<span
					:id="`aioseo-${columnName}-${postId}-value`"
					v-html="imageAltTag"
				/>
			</div>
			<div
				v-if="showEditImageAltTag"
				class="edit-row"
			>
				<textarea
					v-model="imageAltTag"
					class="aioseo-quickedit-input"
					rows="4"
					columns="32"
				/>
				<a
					class="dashicons aioseo-quickedit-input-save"
					@click.prevent="saveImage"
					:title="strings.save"
				>
					<svg-circle-check width="20" />
				</a>
				<a
					class="dashicons aioseo-quickedit-input-cancel"
					@click.prevent="cancel"
					:title="strings.cancel"
				>
					<svg-circle-close width="20" />
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import { getOptions } from '@/vue/utils/options'
import merge from 'lodash/merge'
import { mapState } from 'vuex'
import { Tags, TruSeoScore } from '@/vue/mixins'
import { shouldShowTruSeoScore } from '@/vue/plugins/truSEO/components'
export default {
	mixins : [ Tags, TruSeoScore ],
	props  : {
		post : Object
	},
	data () {
		return {
			postId              : null,
			columnName          : null,
			value               : null,
			title               : null,
			titleParsed         : null,
			postDescription     : null,
			descriptionParsed   : null,
			imageTitle          : null,
			imageAltTag         : null,
			showEditTitle       : false,
			showEditDescription : false,
			showEditImageTitle  : false,
			showEditImageAltTag : false,
			showTruSeo          : false,
			isSpecialPage       : false,
			strings             : {
				title       : this.$t.__('Title:', this.$td),
				description : this.$t.__('Description:', this.$td),
				imageTitle  : this.$t.__('Image Title:', this.$td),
				imageAltTag : this.$t.__('Image Alt Tag:', this.$td),
				edit        : this.$t.__('Edit', this.$td),
				save        : this.$t.__('Save', this.$td),
				cancel      : this.$t.__('Cancel', this.$td),
				wait        : this.$t.__('Please wait...', this.$td)
			}
		}
	},
	computed : {
		...mapState([ 'options', 'currentPost' ]),
		isWooCommerceProduct () {
			if (window.aioseo.data.isWooCommerceActive && 'product' === this.$root._data.screen.postType) {
				return true
			}
			return false
		}
	},
	methods : {
		save () {
			this.showEditTitle       = false
			this.showEditDescription = false
			this.post.title          = this.title
			this.post.description    = this.postDescription
			this.$http.post(this.$links.restUrl('postscreen'))
				.send({
					postId      : this.post.id,
					title       : this.post.title,
					description : this.post.description
				})
				.then((response) => {
					this.titleParsed       = response.body.title
					this.descriptionParsed = response.body.description

					if ('upload' !== this.$root._data.screen.base) {
						this.runAnalysis(this.post.id)
					}
				})
				.catch(error => {
					console.error(`Unable to update post with ID ${this.post.id}: ${error}`)
				})
		},
		saveImage () {
			this.showEditImageTitle  = false
			this.showEditImageAltTag = false
			this.post.title          = this.title
			this.post.description    = this.postDescription
			this.post.imageTitle     = this.imageTitle
			this.post.imageAltTag    = this.imageAltTag
			this.$http.post(this.$links.restUrl('postscreen'))
				.send({
					postId      : this.post.id,
					isMedia     : true,
					title       : this.post.title,
					description : this.post.description,
					imageTitle  : this.post.imageTitle,
					imageAltTag : this.post.imageAltTag
				})
				.then(() => {})
				.catch(error => {
					console.error(`Unable to update attachment with ID ${this.post.id}: ${error}`)
				})
		},
		cancel () {
			this.value               = this.post.value
			this.showEditTitle       = false
			this.showEditDescription = false
			this.showEditImageTitle  = false
			this.showEditImageAltTag = false
		},
		editTitle () {
			this.showEditTitle = true
		},
		editDescription () {
			this.showEditDescription  = true
		},
		editImageTitle () {
			this.showEditImageTitle = true
		},
		editImageAlt () {
			this.showEditImageAltTag = true
		},
		updatePostTitle (postId, value) {
			const post = document.getElementById(`post-${postId}`)
			if (!post) {
				return
			}
			const title = post.getElementsByClassName('title')[0].getElementsByTagName('a')[0]
			if (!title) {
				return
			}
			const image = title.getElementsByTagName('span')[0]
			title.innerText = value
			title.prepend(image)
		}
	},
	mounted () {
		this.postId            = this.post.id
		this.columnName        = this.post.columnName
		this.value             = this.post.value
		this.imageTitle        = this.post.imageTitle
		this.imageAltTag       = this.post.imageAltTag
		this.isSpecialPage     = this.post.isSpecialPage
		this.title             = this.post.title || this.post.defaultTitle
		this.titleParsed       = this.post.titleParsed
		this.postDescription   = this.post.description || this.post.defaultDescription
		this.descriptionParsed = this.post.descriptionParsed
	},
	async created () {
		const { options, currentPost, tags } = await getOptions(this.$http)
		this.$set(this.$store.state, 'options', merge({ ...this.$store.state.options }, { ...options }))
		this.$set(this.$store.state, 'currentPost', merge({ ...this.$store.state.currentPost }, { ...currentPost }))
		this.$set(this.$store.state, 'tags', merge({ ...this.$store.state.tags }, { ...tags }))
		this.showTruSeo = shouldShowTruSeoScore()
	}
}
</script>

<style lang="scss">
.aioseo-meta-options {
	float: left;
	display: block;
	opacity: 1;
	overflow: hidden;
	width: 100%;

	&.editing {
		max-height: initial;
		overflow: visible;
	}

	.dashicons {
		cursor: pointer;
	}

	.aioseo-quickedit {
		margin-right: 5px;
		color: #72777c;

		&:hover {
			color: #0073aa;
			outline: 0;
		}
	}

	.aioseo-quickedit-input {
		float:left;
		position:relative;
		margin-bottom: 10px;
		font-size:13px;
		width:100%;
		z-index:1;
	}

	.aioseo-quickedit-input-save {
		margin-right: 5px;
		color: rgb(22, 204, 22);
	}

	.aioseo-quickedit-input-cancel {
		color: red;
	}

	.aioseo-quickedit:focus,
	.aioseo-quickedit-input-save:focus,
	.aioseo-quickedit-input-cancel:focus  {
		box-shadow: none;
	}

	.aioseo-quickedit-spinner {
		float:left;
		width:20px;
		margin-right:5px;
	}

	.edit-row {
		margin-bottom: 10px;
		&.edit-title,
		&.edit-description,
		&.edit-image-title,
		&.edit-image-alt {
			max-height: 70px;
			overflow: hidden;
		}
	}
}

table.wp-list-table {
	.column-name {
		width: auto !important;
	}
}

td.seotitle.column-seotitle,
td.seodesc.column-seodesc,
td.seokeywords.column-seokeywords {
	overflow: visible;
}

@media screen and (max-width: 782px) {
	body.wp-admin {
		th.column-seotitle,
		th.column-seodesc,
		th.column-seokeywords,
		td.seotitle.column-seotitle,
		td.seodesc.column-seodesc,
		td.seokeywords.column-seokeywords {
			display: none;
		}
	}
}
</style>