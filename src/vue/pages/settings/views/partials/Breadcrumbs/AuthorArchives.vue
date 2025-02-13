<template>
	<core-settings-row
		name="Author"
		key="Author"
	>
		<template #content>
			<div>
				<preview :preview-data="getPreview()"
						 :useDefaultTemplate="dynamicOptions.breadcrumbs.archives.author.useDefaultTemplate"></preview>
				<grid-row>
					<grid-column>
						<base-toggle
							v-model="dynamicOptions.breadcrumbs.archives.author.useDefaultTemplate"
							class="current-item"
						/>
						{{ strings.useDefaultTemplate }}
					</grid-column>
				</grid-row>
				<grid-row v-if="!dynamicOptions.breadcrumbs.archives.author.useDefaultTemplate">
					<grid-column
						v-if="options.breadcrumbs.breadcrumbPrefix && options.breadcrumbs.breadcrumbPrefix.length">
						<base-toggle
							v-model="dynamicOptions.breadcrumbs.archives.author.showPrefixCrumb"
							class="current-item"
						/>
						{{ strings.showPrefixLabel }}
					</grid-column>
					<grid-column>
						<base-toggle
							v-model="dynamicOptions.breadcrumbs.archives.author.showHomeCrumb"
							class="current-item"
						/>
						{{ strings.showHomeLabel }}
					</grid-column>
					<grid-column>
						<core-html-tags-editor
							v-model="dynamicOptions.breadcrumbs.archives.author.template"
							:line-numbers="true"
							checkUnfilteredHtml
							tags-context="breadcrumbs-author"
							:minimum-line-numbers="3"
							:default-tags="[
										'breadcrumb_author_display_name',
										'breadcrumb_link'
									]"
						>
						</core-html-tags-editor>
					</grid-column>
				</grid-row>
			</div>
		</template>
	</core-settings-row>
</template>

<script>
import { mapState } from 'vuex'
import preview from './Preview'

export default {
	components : { preview },
	data () {
		return {
			strings : {
				useDefaultTemplate : this.$t.__('Use a default template', this.$td),
				showHomeLabel      : this.$t.__('Show homepage link', this.$td),
				showPrefixLabel    : this.$t.__('Show prefix link', this.$td),
				authorName         : this.$t.__('Author name', this.$td),
				authorNameFirst    : this.$t.__('First name', this.$td),
				authorNameLast     : this.$t.__('Last name', this.$td)
			}
		}
	},
	methods : {
		getPreview () {
			const breadcrumbOptions = this.options.breadcrumbs
			const archiveOptions = this.dynamicOptions.breadcrumbs.archives.author
			const useDefault = archiveOptions.useDefaultTemplate
			return [
				(useDefault && breadcrumbOptions.breadcrumbPrefix) || (!useDefault && archiveOptions.showPrefixCrumb) ? breadcrumbOptions.breadcrumbPrefix : '',
				(useDefault && breadcrumbOptions.homepageLink) || (!useDefault && archiveOptions.showHomeCrumb) ? (breadcrumbOptions.homepageLabel ? breadcrumbOptions.homepageLabel : 'Home') : '',
				this.getTemplate()
			]
		},
		getTemplate () {
			let template = this.dynamicOptions.breadcrumbs.archives.author.useDefaultTemplate ? this.$aioseo.breadcrumbs.defaultTemplates.archives.author : this.dynamicOptions.breadcrumbs.archives.author.template
			template = template.replace(/#breadcrumb_author_display_name/g, this.strings.authorName)
			template = template.replace(/#breadcrumb_author_first_name/g, this.strings.authorNameFirst)
			template = template.replace(/#breadcrumb_author_last_name/g, this.strings.authorNameLast)
			return template
		}
	},
	computed : {
		...mapState([ 'options', 'dynamicOptions' ])
	}
}
</script>