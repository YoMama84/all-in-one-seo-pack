import { setOptions } from '@/vue/utils/options'

export default {
	filter ({ state, commit }, { slug, additional }) {
		if ('404' === slug || 'logs' === slug) {
			commit('resetSelectedFilters')
		}

		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/${slug}/`)
			.send({
				additional,
				searchTerm : state.searchTerm,
				page       : state.paginatedPage
			})
			.then(response => {
				if ('404' === slug) {
					commit('updateLogs404', response.body.rows)
					commit('updateTotals404', response.body.totals)
					state.logs404 = response.body.rows
					setOptions({
						redirects : state
					})
					return
				}
				if ('logs' === slug) {
					commit('updateLogs', response.body.rows)
					commit('updateTotalsLogs', response.body.totals)
					state.logs = response.body.rows
					setOptions({
						redirects : state
					})
					return
				}

				state.rows = response.body.rows
				setOptions({
					redirects : state
				})
				commit('updateFilters', response.body.filters)
				commit('updateRows', response.body.rows)
				commit('updateTotals', response.body.totals)
			})
	},
	bulk ({ getters, state, commit }, { action, rowIds }) {
		const { rows, selectedFilters } = state
		// First, let's remove any rows that are already set to this action.
		rowIds = rowIds.filter(rowId => {
			const row = rows.find(r => r.id === parseInt(rowId))
			if ('enable' === action && row.enabled) {
				return false
			}

			if ('disable' === action && !row.enabled) {
				return false
			}

			if ('reset-hits' === action && !row.hits) {
				return false
			}

			return true
		})

		if (!rowIds.length) {
			return Promise.resolve()
		}

		// Convert the rowIds into an object with hashes.
		let rowIdsWithHashes = rowIds
		if ('enable' === action || 'disable' === action) {
			rowIdsWithHashes = {}
			rowIds.forEach(rowId => {
				const row = rows.find(r => r.id === parseInt(rowId))
				rowIdsWithHashes[row.source_url_match_hash] = rowId
			})
		}

		const filter     = getters.getCurrentFilter || { slug: 'search' }
		const httpAction = 'delete' === action ? 'delete' : 'post'
		const url        = 'delete' === action ? '' : `${action}/`
		return this._vm.$http[httpAction](`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/bulk/${url}`)
			.send({
				searchTerm  : state.searchTerm,
				currentPage : state.totals.main.page,
				currentSlug : filter.slug,
				additional  : selectedFilters,
				rowIds      : rowIdsWithHashes
			})
			.then(response => {
				commit('updateFilters', response.body.filters)
				commit('updateRows', response.body.rows)
				commit('updateTotals', response.body.totals)
				setOptions({
					redirects : state
				})
			})
	},
	paginate ({ getters, state, commit }, { page, paginate404, paginateLogs, filter, additional }) {
		const orderBy = {
			column  : null,
			sortDir : null
		}
		if (paginate404) {
			orderBy.column  = state.sort.logs404
			orderBy.sortDir = state.sortDir.logs404
		} else if (paginateLogs) {
			orderBy.column  = state.sort.logs
			orderBy.sortDir = state.sortDir.logs
		}

		filter = filter || getters.getCurrentFilter
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/paginate/${filter.slug}/${page}/`)
			.send({
				additional,
				orderBy
			})
			.then(response => {
				setOptions({
					redirects : state
				})
				if (paginate404) {
					commit('updateLogs404', response.body.rows)
					commit('updateTotals404', response.body.totals)
					commit('setPaginatedPageNumber', response.body.totals.page)
					return
				}
				if (paginateLogs) {
					commit('updateLogs', response.body.rows)
					commit('updateTotalsLogs', response.body.totals)
					commit('setPaginatedPageNumber', response.body.totals.page)
					return
				}
				commit('updateRows', response.body.rows)
				commit('updateTotals', response.body.totals)
				commit('setPaginatedPageNumber', response.body.totals.page)
			})
	},
	search ({ state, commit }, { searchTerm, page }) {
		commit('resetSelectedFilters')
		return this._vm.$http.get(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/search/${searchTerm}/${page}/`)
			.then(response => {
				commit('updateFilters', response.body.filters)
				commit('updateRows', response.body.rows)
				commit('updateTotals', response.body.totals)
				setOptions({
					redirects : state
				})
			})
	},
	create (context, payload) {
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/`)
			.send(payload)
	},
	update ({ commit, state }, { id, payload }) {
		const rows = state.rows
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/${id}/`)
			.send(payload)
			.then(response => {
				if (response.body.redirect && response.body.redirect.id) {
					const redirectIndex = rows.findIndex(r => r.id === response.body.redirect.id)
					if (-1 !== redirectIndex) {
						rows[redirectIndex] = response.body.redirect
						commit('updateRows', rows)

						setOptions({
							redirects : state
						})
					}
				}
			})
	},
	delete (context, id) {
		return this._vm.$http.delete(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/${id}`)
	},
	delete404 (context, urls) {
		return this._vm.$http.delete(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/logs-404/`)
			.send({
				urls
			})
	},
	deleteLog (context, urls) {
		return this._vm.$http.delete(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/logs/`)
			.send({
				urls
			})
	},
	exportServerRedirects (context, server) {
		return this._vm.$http.get(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/export/${server}/`)
	},
	exportRedirects (context, { groups, type }) {
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/export/${type}/`)
			.send({
				groups
			})
	},
	exportLogs (context, type) {
		return this._vm.$http.get(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/export-logs/${type}/`)
	},
	uploadFile ({ commit }, { file, filename }) {
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/import/`)
			.attach('file', file, filename)
			.then(response => {
				commit('updateFilters', response.body.filters)
				commit('updateRows', response.body.rows)
				commit('updateTotals', response.body.totals)
			})
	},
	importPlugins ({ dispatch }, plugins) {
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/import-plugins/`)
			.send({
				plugins
			})
			.then(() => dispatch('filter', { slug: 'all' }))
	},
	getPosts (context, payload) {
		return this._vm.$http.post(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/posts/`)
			.send(payload)
			.then(response => {
				if (!response.body.success) {
					throw new Error(response.body.message)
				}

				return response
			})
	},
	getRedirectOptions ({ commit }) {
		return this._vm.$http.get(`${this._vm.$aioseo.urls.restUrl}aioseo/v1/redirects/options/`)
			.then(response => {
				if (response.body.options) {
					commit('updateOptions', response.body.options)
					const redirects     = this._vm.$aioseo.redirects
					redirects.importers = response.body.importers
					setOptions({
						options : response.body.options,
						redirects
					})
				}
			})
	}
}