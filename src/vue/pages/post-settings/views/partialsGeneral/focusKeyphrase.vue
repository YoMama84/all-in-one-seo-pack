<template>
	<div class="aioseo-focus-keyphrase-panel">
		<base-input
			v-if="!currentPost.keyphrases.focus || !currentPost.keyphrases.focus.keyphrase"
			size="medium"
			:class="`add-focus-keyphrase-${this.$root._data.screenContext}-input`"
			@keydown.enter="pressEnter"
		/>

		<div
			style="display:flex;align-items-center;"
		>
			<base-button
				v-if="!currentPost.keyphrases.focus || !currentPost.keyphrases.focus.keyphrase"
				id="add-focus-keyphrase"
				class="add-keyphrase gray small"
				@click="addKeyphraseEv"
			>
				<svg-circle-plus width="14" height="14" />
				{{ strings.addKeyphrase }}
			</base-button>

			<core-tooltip
				v-if="!currentPost.keyphrases.focus.keyphrase"
			>
				<div
					class="disabled-button gray"
				>
					<svg-circle-plus width="14" height="14" />
					{{ strings.getAdditionalKeyphrases }}
				</div>

				<template #tooltip>
					<span>
						{{ strings.semrushGetAdditionalKeyphrases }}
						{{ strings.pleaseAddFocusKeyphrase }}
					</span>
				</template>
			</core-tooltip>
		</div>

		<core-keyphrase
			v-if="currentPost.keyphrases.focus && currentPost.keyphrases.focus.keyphrase"
			:index=0
			:keyphrase="currentPost.keyphrases.focus.keyphrase"
			:score="currentPost.keyphrases.focus.score"
			@saved="onSaved"
			@deleted="onDeleted"
			class="aioseo-keyphrase-tag"
		/>

		<core-loader
			class="analysis-loading"
			v-if="currentPost.loading.focus && currentPost.keyphrases.focus"
			dark
		/>
		<metaboxAnalysisDetail
			v-if="!currentPost.loading.focus && currentPost.keyphrases.focus && currentPost.keyphrases.focus.keyphrase"
			:analysisItems="currentPost.keyphrases.focus.analysis"
		/>

		<core-tooltip
			v-if="!currentPost.loading.focus && currentPost.keyphrases.focus.keyphrase && $isPro && isUnlicensed"
		>
			<div
				class="disabled-button gray"
			>
				<svg-circle-plus width="14" height="14" />
				{{ strings.getAdditionalKeyphrases }}
			</div>

			<template #tooltip>
				<span
					v-html="strings.semrushTooltipLicenseKey"
				/>
			</template>
		</core-tooltip>

		<core-tooltip
			v-if="!currentPost.loading.focus && currentPost.keyphrases.focus.keyphrase && (!$isPro || !isUnlicensed)"
			:disabled="!showSemrushTooltip || $isPro"
			:force-show="showSemrushTooltip && !$isPro"
		>
			<base-button
				class="add-keyphrase gray small"
				@click="getAdditionalKeyphrases"
			>
				<svg-circle-plus width="14" height="14" />
				{{ strings.getAdditionalKeyphrases }}
			</base-button>

			<template #tooltip>
				<span>
					{{ strings.semrushTooltip }}
				</span>
			</template>
		</core-tooltip>

		<core-modal
			v-if="semrushShowModal"
			@close="semrushShowModal = false"
			isolate
			:classes="[
				'aioseo-focus-keyphrase-panel-modal'
			]"
		>
			<div slot="headerTitle">
				{{ strings.modalTitle }}
			</div>
			<div slot="body">
				<div class="aioseo-modal-content has-padding">
					<core-alert
						v-if="isUnlicensed"
						type="blue"
						v-html="strings.upsell"
					/>
					<div class="aioseo-settings-row">
						<div class="settings-name">
							<div class="name">
								{{ strings.showResultsFor }}
							</div>
						</div>
						<base-select
							class="semrush-country-selector"
							size="medium"
							:options="semrushDatabase"
							:placeholder="strings.selectPriceIndicator"
							v-model="semrushCountry"
						/>
					</div>

					<div class="results">
						<table
							class="additional-keyphrases-table"
							cellpadding="0"
							cellspacing="0"
						>
							<thead>
								<tr class="keyphrases-header">
									<th class="keyphrase">{{ strings.keyphrase }}</th>
									<th class="keyphrase-volume">{{ strings.volume }}</th>
									<th class="keyphrase-trend">{{ strings.trend }}</th>
									<th
										v-if="!isUnlicensed"
										class="keyphrase-actions"
									/>
								</tr>
							</thead>
							<tbody class="keyphrases-rows">
								<template
									v-if="semrush.results.length && !loadingResults"
								>
									<tr
										class="keyphrase-row"
										:class="{ even: 0 === index % 2 }"
										v-for="(keyphrase, index) in semrush.results"
										:key="index"
									>
										<td class="keyphrase">
											{{ keyphrase[0] }}
										</td>
										<td class="keyphrase-volume">
											{{ keyphrase[1] }}
										</td>
										<td class="keyphrase-trend">
											<svg-area-chart
												:width="66"
												:height="24"
												:data="transformTrendDataToChartPoints(keyphrase[2])"
												:strokeWidth="1.8"
												strokeColor="#498afc"
												fillColor="#ade3fc"
											/>
										</td>
										<td
											v-if="!isUnlicensed"
											class="keyphrase-actions"
										>
											<div
												v-if="keyphrase[0] === currentPost.keyphrases.focus.keyphrase.toLowerCase()"
												class="focus-keyphrase"
											>
												<svg-circle-check />
												{{ strings.focusKeyphrase }}
											</div>
											<div
												v-if="keyphrase[0] !== currentPost.keyphrases.focus.keyphrase.toLowerCase()"
											>
												<base-button
													v-if="index !== removingAdditionalKeyphrase && (index === addingAdditionalKeyphrase || !hasAdditionalKeyphrase(keyphrase[0]))"
													type="gray"
													size="small"
													@click="addAdditionalKeyphrase(keyphrase[0], index)"
													:loading="index === addingAdditionalKeyphrase"
												>
													{{ strings.addAdditionalKeyphrase }}
												</base-button>

												<div
													class="remove-keyphrase"
													v-if="getAdditionalKeyphrase(keyphrase[0]) && index !== addingAdditionalKeyphrase && (index === removingAdditionalKeyphrase || hasAdditionalKeyphrase(keyphrase[0]))"
												>
													<span
														class="keyphrase-score"
														:class="scoreClass(getAdditionalKeyphrase(keyphrase[0]).score)"
														@click="goToAdditionalKeyphrase(keyphrase[0])"
													>{{ getAdditionalKeyphrase(keyphrase[0]).score }}/100</span>

													<core-tooltip
														type="action"
													>
														<svg-trash
															@click.native="removeAdditionalKeyphrase(keyphrase[0], index)"
														/>

														<template #tooltip>
															{{ strings.delete }}
														</template>
													</core-tooltip>
												</div>
											</div>
										</td>
									</tr>
								</template>

								<template
									v-if="!semrush.results.length || loadingResults"
								>
									<tr class="keyphrase-row">
										<td
											:colspan="isUnlicensed ? 3 : 4"
											class="no-results"
										>
											<div>
												<core-loader
													v-if="loadingResults"
													dark
												/>

												<span
													v-if="!loadingResults && !semrush.error"
												>
													{{ strings.noResults }}
												</span>

												<core-alert
													type="red"
													v-if="semrush.error"
												>
													{{ semrushError }}
												</core-alert>
											</div>
										</td>
									</tr>
								</template>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</core-modal>
	</div>
</template>

<script>
import { popup } from '@/vue/utils/popup'
import { getParams } from '@/vue/utils/params'
import { mapActions, mapGetters, mapState } from 'vuex'
import { IsDirty } from '@/vue/mixins'
import metaboxAnalysisDetail from './metaboxAnalysisDetail'
export default {
	mixins     : [ IsDirty ],
	components : {
		metaboxAnalysisDetail
	},
	data () {
		return {
			showSemrushTooltip          : false,
			loadingResults              : false,
			semrushShowModal            : false,
			addingAdditionalKeyphrase   : false,
			removingAdditionalKeyphrase : false,
			semrushCountry              : { value: 'US', label: 'United States of America - US' },
			strings                     : {
				// Translators: 1 - Semrush.
				modalTitle                     : this.$t.sprintf(this.$t.__('Additional Keyphrases by %1$s', this.$td), 'Semrush'),
				addKeyphrase                   : this.$t.__('Add Focus Keyphrase', this.$td),
				getAdditionalKeyphrases        : this.$t.__('Get Additional Keyphrases', this.$td),
				showResultsFor                 : this.$t.__('Show Results For:', this.$td),
				keyphrase                      : this.$t.__('Keyphrase', this.$td),
				volume                         : this.$t.__('Volume', this.$td),
				trend                          : this.$t.__('Trend', this.$td),
				addAdditionalKeyphrase         : this.$t.__('Add Keyphrase', this.$td),
				removeAdditionalKeyphrase      : this.$t.__('Remove Keyphrase', this.$td),
				noResults                      : this.$t.__('No results', this.$td),
				// Translators: 1 - Plugin short name + Pro "AIOSEO Pro", 2 - Semrush, 3 - Link to learn more.
				upsell                         : this.$t.sprintf(this.$t.__('Analyzing your content with %1$s keywords is only available to licensed %2$s users. %3$s', this.$td), 'Semrush', `<strong>${process.env.VUE_APP_SHORT_NAME} Pro</strong>`, this.$links.getUpsellLink('semrush-keywords', this.$constants.GLOBAL_STRINGS.learnMore, null, true)),
				// Translators: 1 - Plugin short name "AIOSEO", 2 - Semrush.
				semrushGetAdditionalKeyphrases : this.$t.sprintf(this.$t.__('%1$s integrates directly with %2$s to provide you with actionable keyphrases to help you write better content.', this.$td), process.env.VUE_APP_SHORT_NAME, 'Semrush'),
				pleaseAddFocusKeyphrase        : this.$t.__('To use this feature, first add a focus keyphrase.', this.$td),
				focusKeyphrase                 : this.$t.__('Focus Keyphrase', this.$td),
				delete                         : this.$t.__('Delete', this.$td),
				// Translators: 1 - Semrush.
				semrushTooltip                 : this.$t.sprintf(this.$t.__('Get Additional Keyphrases with %1$s!', this.$td), 'Semrush'),
				// Translators: 1 - Opening link tag, 2 - Closing link tag, 3 - Semrush.
				semrushTooltipLicenseKey       : this.$t.sprintf(this.$t.__('%1$sA valid license key is required%2$s in order to connect with %3$s.', this.$td), '<a href="' + this.$aioseo.urls.aio.settings + '">', '</a>', 'Semrush')
			}
		}
	},
	watch : {
		semrushCountry : {
			deep : true,
			handler () {
				this.getKeyphrases()
			}
		}
	},
	computed : {
		...mapGetters('integrations', [ 'semrushExpired', 'semrushHasValidTokens' ]),
		...mapGetters([ 'isUnlicensed', 'isConnected' ]),
		...mapState([ 'currentPost', 'internalOptions' ]),
		...mapState('integrations', [ 'semrush' ]),
		semrushError () {
			if (this.semrush.error.includes('TOTAL LIMIT EXCEEDED')) {
				return this.$t.__('You have exceeded the limit for requests. Please try again later.', this.$td)
			}

			return this.$t.__('An error occurred while fetching keyphrases. Please try again later.', this.$td)
		},
		semrushDatabase () {
			return this.$constants.COUNTRY_LIST
				.map(country => {
					if ('GB' === country.value) {
						country.value = 'UK'
						country.label = 'United Kingdom'
					}

					if ('KR' === country.value) {
						country.label = 'South Korea'
					}

					return country
				})
				.filter(country => this.$constants.SEMRUSH_DATABASE.includes(country.value.toLowerCase()))
				.map(country => {
					country.label = country.label + ' - ' + country.value.toUpperCase()
					return country
				})
		}
	},
	methods : {
		...mapActions('integrations', [ 'semrushAuthenticate', 'semrushRefresh', 'semrushGetKeyphrases' ]),
		...mapActions([ 'saveConnectToken' ]),
		getAdditionalKeyphrases () {
			this.showSemrushTooltip = false
			if (!this.isConnected) {
				this.openConnectPopup(this.$aioseo.urls.connect + '&semrush=true')
				return
			}

			if (!this.semrushHasValidTokens) {
				this.openPopup('https://oauth.semrush.com/auth/login?client_id=aioseo&redirect_uri=https%3A%2F%2Foauth.semrush.com%2Foauth2%2Faioseo%2Fsuccess&ref=2190331110&response_type=code&scope=user.id')
				return
			}

			this.openModal()
		},
		transformTrendDataToChartPoints (trend) {
			const trendArray = trend.split(',')

			return trendArray.map((value, index) => ({ x: index, y: parseFloat(value) }))
		},
		openConnectPopup (url) {
			popup(
				url,
				this.connectWithAioseo,
				600,
				630,
				true,
				[ 'token' ],
				this.completedConnectCallback,
				this.closedConnectCallback
			)
		},
		openPopup (url) {
			popup(
				url,
				'Semrush Oauth',
				450,
				570,
				true,
				[ 'code' ],
				this.completedCallback,
				this.closedCallback,
				this.postMessageCallback
			)
		},
		async completedCallback (payload) {
			return this.semrushAuthenticate(payload.code)
		},
		completedConnectCallback (payload) {
			return this.saveConnectToken(payload.token)
		},
		openModal () {
			this.semrushShowModal = true
			if (this.semrush.error) {
				return
			}

			this.getKeyphrases()
		},
		getKeyphrases () {
			this.loadingResults = true
			this.semrushGetKeyphrases(this.semrushCountry.value)
				.then(() => {
					this.loadingResults = false
				})
				.catch((error) => {
					this.semrushShowModal = false
					this.loadingResults   = false
					console.error(error.message)
				})
		},
		closedCallback (reload) {
			if (reload) {
				this.openModal()
			}
		},
		closedConnectCallback (reload) {
			if (!reload) {
				return
			}

			if (this.semrushHasValidTokens) {
				this.$nextTick(this.getAdditionalKeyphrases)
				return
			}

			// We can't trigger the additional keyphrases popup if they have not connected to Semrush, or the browser will block the popup.
			this.showSemrushTooltip = true
		},
		async postMessageCallback (event, popupWindow, triggerPostMessageCallback) {
			const { data, source, origin } = event

			// Check that the message comes from the expected origin.
			if ('https://oauth.semrush.com' !== origin || popupWindow !== source) {
				return
			}

			if ('semrush:oauth:success' === data.type) {
				// Stop listening to messages, since the popup is closed.
				window.removeEventListener('message', triggerPostMessageCallback, false)

				let params = {}
				try {
					const url = new URL(data.url)
					params = getParams(url.search)
				} catch (e) {}

				this.completedCallback(params)
					.then(() => {
						popupWindow.close()
						popupWindow = null
						this.closedCallback(true)
					})
			}

			if ('semrush:oauth:denied' === data.type) {
				popupWindow.close()
				// Stop listening to messages, since the popup is closed.
				window.removeEventListener('message', triggerPostMessageCallback, false)
				popupWindow = null
				this.closedCallback()
			}
		},
		onSaved (payload) {
			const { value }   = payload
			this.currentPost.keyphrases.focus.keyphrase = value
			this.currentPost.loading.focus = true
			setTimeout(() => {
				this.$truSEO.runAnalysis({ postId: this.currentPost.id, postData: this.currentPost })
				this.currentPost.loading.focus = false
				this.setIsDirty()
			}, 2000)
		},
		onDeleted () {
			this.currentPost.keyphrases.focus = {}
			this.currentPost.loading.focus = true
			setTimeout(() => {
				this.$truSEO.runAnalysis({ postId: this.currentPost.id, postData: this.currentPost })
				this.currentPost.loading.focus = false
				this.setIsDirty()
			}, 2000)
		},
		addKeyphraseEv () {
			const keyphraseInputComponent = document.getElementsByClassName(`add-focus-keyphrase-${this.$root._data.screenContext}-input`)
			const keyphraseInput          = keyphraseInputComponent[0].querySelector('.medium')
			if (keyphraseInput.value) {
				const newKeyphrase = { keyphrase: keyphraseInput.value, score: 0, analysis: {} }
				this.$set(this.currentPost.keyphrases, 'focus', newKeyphrase)
				this.currentPost.loading.focus = true
				keyphraseInput.value = ''
				keyphraseInput.blur()
				setTimeout(() => {
					this.$truSEO.runAnalysis({ postId: this.currentPost.id, postData: this.currentPost })
					this.currentPost.loading.focus = false
					this.setIsDirty()
				}, 2000)
			}
		},
		hasAdditionalKeyphrase (keyphrase) {
			const { additional } = this.currentPost.keyphrases
			return additional.filter(k => k.keyphrase.toLowerCase() === keyphrase).length
		},
		getAdditionalKeyphrase (keyphrase) {
			const { additional } = this.currentPost.keyphrases
			return additional.find(k => k.keyphrase.toLowerCase() === keyphrase)
		},
		scoreClass (score) {
			return 80 < score ? 'score-green' : 50 < score ? 'score-orange' : 1 < score ? 'score-red' : 'score-none'
		},
		addAdditionalKeyphrase (keyphrase, index) {
			this.addingAdditionalKeyphrase = index
			const { additional }           = this.currentPost.keyphrases
			const keyphraseIndex           = additional.push({ keyphrase, score: 0 })
			const keyphrasePanel           = document.getElementsByClassName('keyphrase-name')
			this.$set(this.currentPost.keyphrases, 'additional', additional)
			this.$nextTick(() => {
				setTimeout(() => {
					this.$truSEO.runAnalysis({ postId: this.currentPost.id, postData: this.currentPost })
					if (keyphrasePanel[keyphraseIndex]) {
						keyphrasePanel[keyphraseIndex].click()
					}
					this.setIsDirty()
					this.addingAdditionalKeyphrase = false
				}, 2000)
			})
		},
		goToAdditionalKeyphrase (keyphrase) {
			const { additional }             = this.currentPost.keyphrases
			const keyphraseIndex             = additional.findIndex(k => k.keyphrase.toLowerCase() === keyphrase)
			if (-1 !== keyphraseIndex) {
				const keyphrasePanel = document.getElementsByClassName('keyphrase-name')
				if (keyphrasePanel[keyphraseIndex + 1]) {
					keyphrasePanel[keyphraseIndex + 1].click()
				}
				this.semrushShowModal = false
			}
		},
		removeAdditionalKeyphrase (keyphrase, index) {
			this.removingAdditionalKeyphrase = index
			const { additional }             = this.currentPost.keyphrases
			const keyphraseIndex             = additional.findIndex(k => k.keyphrase.toLowerCase() === keyphrase)
			if (-1 !== keyphraseIndex) {
				additional.splice(keyphraseIndex, 1)
				this.$set(this.currentPost.keyphrases, 'additional', additional)
				const keyphrasePanel = document.getElementsByClassName('keyphrase-name')
				if (keyphrasePanel[0]) {
					keyphrasePanel[0].click()
				}
			}

			this.$nextTick(() => {
				this.removingAdditionalKeyphrase = false
			})
		},
		toggleDescriptionEv (ev) {
			ev.target.parentElement.classList.toggle('toggled')
		},
		pressEnter (event) {
			const addButon = document.getElementById('add-focus-keyphrase')
			event.preventDefault()
			addButon.click()
		}
	},
	mounted () {
		const promises = []
		if (this.internalOptions.integrations.semrush.accessToken && this.semrushExpired) {
			promises.push(this.semrushRefresh())
		}
	}
}
</script>

<style lang="scss">
// These styles apply to a modal that needs to isolate from the main app.
.aioseo-app.aioseo-focus-keyphrase-panel-modal {
	.modal-body {
		max-height: calc(90vh - 70px);
		overflow: auto;

		.aioseo-modal-content {
			.aioseo-alert {
				margin-bottom: 20px;
			}
		}
	}

	.semrush-country-selector {
		max-width: 350px;
	}

	.additional-keyphrases-table {
		width: 100%;
		border: 1px solid $input-border;
		border-radius: 3px;

		.keyphrase-volume,
		.keyphrase-trend {
			text-align: center;
		}

		.keyphrase-actions {
			> div {
				display: flex;
				align-items: center;
				justify-content: flex-end;
			}

			.focus-keyphrase {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				color: $green;
				min-width: 135px;

				svg {
					margin-right: 5px;
					width: 16px;
					height: 16px;
					color: $green;
				}
			}

			.keyphrase-score {
				border-radius: 3px;
				padding: 5px;
				font-weight: 700;
				font-size: 13px;
				cursor: pointer;
				border: 1px solid $blue;

				&.score-green {
					color: $green;
					border-color: $green;
				}

				&.score-orange {
					color: $orange;
					border-color: $orange;
				}

				&.score-red {
					color: $red;
					border-color: $red;
				}

				&:hover {
					background-color: $blue;
					color: #fff;

					&.score-green {
						background-color: $green;
					}

					&.score-orange {
						background-color: $orange;
					}

					&.score-red {
						background-color: $red;
					}
				}
			}

			.remove-keyphrase {
				display: flex;
				align-items: center;
				justify-content: flex-end;

				svg {
					width: 16px;
					height: 16px;
					cursor: pointer;

					&:hover {
						color: $red;
					}
				}
			}
		}

		.keyphrases-header {
			height: 50px;
			font-size: 14px;

			th {
				border-bottom: 1px solid $input-border;
				padding: 15px;

				&:first-of-type {
					padding-left: 30px;
				}

				&:last-of-type {
					padding-right: 30px;
				}
			}
		}

		.keyphrases-rows {
			font-size: 14px;

			tr.keyphrase-row {
				background-color: #fff;
				height: 70px;

				&:last-of-type {
					td {
						&:first-of-type {
							border-radius: 0 0 0 3px;
						}

						&:last-of-type {
							border-radius: 0 0 3px 0;
						}
					}
				}

				&.even {
					background-color: $box-background;
				}

				td {
					padding: 15px;

					&:first-of-type {
						padding-left: 30px;
					}

					&:last-of-type {
						padding-right: 30px;
					}

					&.no-results {
						> * {
							display: flex;
							align-items: center;
							justify-content: center;
						}
					}
				}

				&.loading {
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}
}
</style>