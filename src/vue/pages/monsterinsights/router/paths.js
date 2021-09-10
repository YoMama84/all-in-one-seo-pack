import { __ } from '@wordpress/i18n'

const td       = process.env.VUE_APP_TEXTDOMAIN
const loadView = view => {
	return () => import(/* webpackChunkName: "monsterinsights-[request]" */ '@/vue/pages/monsterinsights/views/' + view + '.vue')
}

export default [
	{
		path     : '*',
		redirect : '/'
	},
	{
		path      : '/',
		name      : 'monsterinsights',
		component : loadView('Main'),
		meta      : {
			access : 'aioseo_manage_seo',
			name   : __('Analytics', td)
		}
	}
]