<template>
	<div
		class="aioseo-redirect-source-url"
		ref="redirect-source-url"
	>
		<base-input
			:value="url.url"
			@input="value => updateSourceUrl(value)"
			@keyup="searchChange"
			@focus="showResults = true"
			:disabled="log404"
			size="medium"
			placeholder="/source-page/"
			:class="{
				'aioseo-error'  : url.errors.length,
				'aioseo-active' : !url.errors.length && !url.warnings.length && url.url,
				'aioseo-warning' : url.warnings.length
			}"
		>
			<template #append-icon>
				<div class="append-icon">
					<template
						v-if="!isLoading"
					>
						<svg-circle-close
							v-if="url.errors.length"
						/>
						<svg-circle-check
							v-if="!url.errors.length && !url.warnings.length && url.url"
						/>
						<svg-circle-exclamation
							v-if="url.warnings.length"
						/>
						<svg-gear
							:class="{ active: urlOptionsActive }"
							@click.native="showOptions = !showOptions"
						/>
						<svg-trash
							v-if="allowDelete"
							@click.native="$emit('remove-url')"
						/>
					</template>

					<core-loader
						v-if="isLoading"
						dark
					/>
				</div>
			</template>
		</base-input>

		<core-add-redirection-url-results
			v-if="!url.regex && showResults && results.length"
			:results="results"
			:url="url.url"
			@set-url="setUrl"
		/>

		<slot name="source-url-description" v-if="!log404" />

		<transition-slide
			:active="showOptions"
			class="source-url-options"
		>
			<div>
				<grid-row>
					<grid-column
						xs="4"
					>
						<base-checkbox
							size="medium"
							:value="url.ignoreSlash"
							@input="value => updateOption('ignoreSlash', value)"
						>
							{{ strings.ignoreSlash }}
						</base-checkbox>
					</grid-column>
					<grid-column
						xs="4"
					>
						<base-checkbox
							size="medium"
							:value="url.ignoreCase"
							@input="value => updateOption('ignoreCase', value)"
						>
							{{ strings.ignoreCase }}
						</base-checkbox>
					</grid-column>
					<grid-column
						xs="4"
						v-if="!log404"
					>
						<base-checkbox
							size="medium"
							:value="url.regex"
							@input="value => updateOption('regex', value)"
						>
							{{ strings.regex }}
						</base-checkbox>
					</grid-column>
				</grid-row>
			</div>
		</transition-slide>

		<transition-slide
			:active="!!url.errors.length"
		>
			<core-alert
				v-for="(error, index) in url.errors"
				:key="index"
				class="source-url-error"
				type="red"
				size="small"
				v-html="error"
			/>
		</transition-slide>

		<transition-slide
			:active="!!url.warnings.length"
		>
			<core-alert
				v-for="(warning, index) in url.warnings"
				:key="index"
				class="source-url-warning"
				type="yellow"
				size="small"
				v-html="warning"
			/>
		</transition-slide>
	</div>
</template>

<script>
import { debounce } from '@/vue/utils/debounce'
import { mapActions } from 'vuex'
export default {
	props : {
		url : {
			type : Object,
			default () {
				return {
					id          : null,
					url         : null,
					regex       : false,
					ignoreSlash : true,
					ignoreCase  : true,
					errors      : [],
					warnings    : []
				}
			}
		},
		allowDelete : Boolean,
		targetUrl   : String,
		log404      : Boolean
	},
	data () {
		return {
			showResults : false,
			isLoading   : false,
			showOptions : false,
			strings     : {
				ignoreSlash : this.$t.__('Ignore Slash', this.$td),
				ignoreCase  : this.$t.__('Ignore Case', this.$td),
				regex       : this.$t.__('Regex', this.$td)
			},
			results : []
		}
	},
	watch : {
		targetUrl () {
			this.updateSourceUrl(this.url.url)
		}
	},
	computed : {
		maybeRegex () {
			if (null !== this.url.url.match(/[*\\()[\]^$]/)) {
				return true
			}

			if (-1 !== this.url.url.indexOf('.?')) {
				return true
			}

			return false
		},
		invalidUrl () {
			if (!this.url.url) {
				return false
			}

			const errors = []
			if (this.url.regex) {
				try {
					new RegExp(this.url.url)
				} catch (e) {
					errors.push(this.$t.__('The regex syntax is invalid.', this.$td))
					return errors
				}
			}

			if ('http' === this.url.url.substr(0, 4) && -1 === this.url.url.indexOf(document.location.origin)) {
				errors.push(this.$t.__('Please enter a valid relative source URL.', this.$td))
			}

			if (this.url.url.match(/%\w+%/)) {
				errors.push(this.$t.__('Permalinks are not currently supported.', this.$td))
			}

			if ('/(.*)' === this.url.url || '^/(.*)' === this.url.url) {
				errors.push(this.$t.__('This redirect is supported using the Relocate Site feature under Full Site Redirect tab.', this.$td))
			}

			if (
				this.targetUrl &&
				0 < this.url.url.length &&
				(
					this.targetUrl === this.url.url ||
					this.targetUrl + '/' === this.url.url ||
					this.targetUrl === this.url.url + '/' ||
					(
						this.url.regex &&
						this.targetUrl.match(this.url.url)
					)
				)
			) {
				errors.push(this.$t.__('Your source is the same as a target and this will create a loop.', this.$td))
			}

			return errors
		},
		iffyUrl () {
			if (!this.url.url) {
				return []
			}

			const warnings = []
			if ('http' !== this.url.url.substr(0, 4) && '/' !== this.url.url.substr(0, 1) && 0 < this.url.url.length && !this.url.regex) {
				// Translators: 1 - Adds a html tag with an option like: <code>/</code>
				warnings.push(this.$t.sprintf(this.$t.__('The source URL should probably start with a %1$s', this.$td), '<code>/</code>'))
			}

			if (-1 !== this.url.url.indexOf('#')) {
				warnings.push(this.$t.__('Anchor values are not sent to the server and cannot be redirected.', this.$td))
			}

			if (!this.log404 && this.maybeRegex && !this.url.regex) {
				// Translators: 1 - Adds a html tag with an option like: <code>Regex</code>
				warnings.push(this.$t.sprintf(this.$t.__('Remember to enable the %1$s option if this is a regular expression.', this.$td), '<code>Regex</code>'))
			}

			if (this.url.regex) {
				if (-1 === this.url.url.indexOf('^') && -1 === this.url.url.indexOf('$')) {
					// Translators: 1 - Adds a html tag with an option like: <code>^</code>, 2 - Adds a html tag with an option like: <code>^</code>.
					warnings.push(this.$t.sprintf(this.$t.__('To prevent a greedy regular expression you can use %1$s to anchor it to the start of the URL. For example: %2$s', this.$td), '<code>^/</code>', '<code>^/' + this.url.url.replace(/^\//, '') + '</code>'))
				}

				if (0 < this.url.url.indexOf('^')) {
					// Translators: 1 - Adds a html tag with an option like: <code>^</code>, 2 - Adds a html tag with an option like: <code>^</code>.
					warnings.push(this.$t.sprintf(this.$t.__('The caret %1$s should be at the start. For example: %2$s', this.$td), '<code>^/</code>', '<code>^/' + this.url.url.replace('^', '').replace(/^\//, '') + '</code>'))
				}

				if (0 === this.url.url.indexOf('^') && -1 === this.url.url.indexOf('^/')) {
					// Translators: 1 - Adds a html tag with an option like: <code>^/</code>
					warnings.push(this.$t.sprintf(this.$t.__('The source URL should probably start with a %1$s', this.$td), '<code>^/</code>'))
				}

				if (this.url.url.length - 1 !== this.url.url.indexOf('$') && -1 !== this.url.url.indexOf('$')) {
					// Translators: 1 - Adds a html tag with an option like: <code>^/</code>
					warnings.push(this.$t.sprintf(this.$t.__('The dollar symbol %1$s should be at the end. For example: %2$s', this.$td), '<code>$</code>', '<code>' + this.url.url.replace(/\$/g, '') + '$</code>'))
				}
			}

			// Warning if a URL with a common file extension
			if (null !== this.url.url.match(/(\.html|\.htm|\.php|\.pdf|\.jpg)$/)) {
				warnings.push(this.$t.__('Some servers may be configured to serve file resources directly, preventing a redirect occurring.', this.$td))
			}

			return warnings
		},
		urlOptionsActive () {
			return this.url.regex || this.showOptions
		}
	},
	methods : {
		...mapActions('redirects', [ 'getPosts' ]),
		updateSourceUrl (value) {
			// First, let's format the URL for duplicate slashes.
			if (value) {
				value = value.replace(/(https?:\/)(\/)+|(\/)+/g, '$1$2$3')
			}

			this.$set(this.url, 'url', value)
			this.$set(this.url, 'errors', this.invalidUrl)
			this.$set(this.url, 'warnings', this.iffyUrl)
			this.$emit('updated-url', this.url)
		},
		updateOption (option, value) {
			this.$set(this.url, option, value)
			this.updateSourceUrl(this.url.url)

			this.$emit('updated-option', this.url)
		},
		searchChange () {
			if (!this.url.url || this.url.regex) {
				return
			}

			// Don't search if the string starts with known characters.
			if (
				this.url.url.startsWith('/') ||
				this.url.url.startsWith('^') ||
				this.url.url.startsWith('http:') ||
				this.url.url.startsWith('https:')
			) {
				this.isLoading = false
				return
			}

			this.isLoading = true
			debounce(() => {
				if (!this.url.url) {
					this.isLoading = false
					return
				}

				this.showResults = true

				this.ajaxSearch(this.url.url)
					.then(() => (this.isLoading = false))
			}, 500)
		},
		ajaxSearch (query) {
			return this.getPosts({ query })
				.then((response) => {
					this.results = response.body.objects
				})
		},
		setUrl (url) {
			this.showResults = false
			this.updateOption('url', url.replace(this.$aioseo.urls.mainSiteUrl, '', url))
		},
		documentClick (event) {
			if (!this.showResults) {
				return
			}

			const target  = event && event.target ? event.target : null
			const element = this.$refs['redirect-source-url']

			if (element && element !== target && !element.contains(target)) {
				this.showResults = false
			}
		}
	},
	mounted () {
		if (this.url.showOptions) {
			this.showOptions = true
			this.updateSourceUrl(this.url.url)
		}

		document.addEventListener('click', this.documentClick)
	},
	beforeDestroy () {
		document.removeEventListener('click', this.documentClick)
	}
}
</script>

<style lang="scss">
.aioseo-redirect-source-url {
	position: relative;

	.aioseo-input {
		input {
			padding-right: 76px !important;
		}

		.append-icon {
			width: 60px;
			justify-content: flex-end;

			svg {
				max-width: 16px;
				margin-right: 5px;

				&:last-of-type {
					margin-right: 0;
				}

				&.aioseo-gear {
					color: $placeholder-color;
					cursor: pointer;

					&:hover,
					&.active {
						color: $blue;
					}
				}

				&.aioseo-circle-check {
					color: $green;
				}

				&.aioseo-circle-close {
					color: $red;
				}

				&.aioseo-trash {
					color: $placeholder-color;
					cursor: pointer;

					&:hover,
					&.active {
						color: $red;
					}
				}
			}
		}
	}

	.source-url-warning,
	.source-url-error {
		margin-bottom: 10px;
	}

	.source-url-options {
		> div {
			padding-bottom: 5px;

			> div {
				margin-bottom: 5px;
			}
		}
	}
}
</style>