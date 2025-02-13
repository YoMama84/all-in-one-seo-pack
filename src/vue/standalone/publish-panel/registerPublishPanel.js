import { isBlockEditor } from '@/vue/plugins/truSEO/components/helpers'

(function (wp) {
	if (!isBlockEditor() || !wp.editPost.PluginDocumentSettingPanel) {
		return
	}

	const PluginDocumentSettingPanel = wp.editPost.PluginDocumentSettingPanel
	const PluginPrePublishPanel      = wp.editPost.PluginPrePublishPanel
	const PluginPostPublishPanel     = wp.editPost.PluginPostPublishPanel
	const registerPlugin             = wp.plugins.registerPlugin

	const user = window.aioseo.user
	if (
		!user.capabilities.aioseo_page_analysis &&
		!user.capabilities.aioseo_page_general_settings &&
		!user.capabilities.aioseo_page_advanced_settings
	) {
		return
	}

	registerPlugin('aioseo', {
		render : () => {
			return wp.element.createElement(wp.element.Fragment, {},
				wp.element.createElement(
					PluginDocumentSettingPanel,
					{
						title     : process.env.VUE_APP_SHORT_NAME,
						className : 'aioseo-document-setting aioseo-seo-overview',
						icon      : wp.element.Fragment
					},
					wp.element.createElement(
						'div',
						{},
						wp.element.createElement('div', { id: 'aioseo-document-setting' })
					)
				),
				wp.element.createElement(
					PluginPrePublishPanel,
					{
						title : [
							process.env.VUE_APP_SHORT_NAME,
							':',
							wp.element.createElement('span', { class: 'editor-post-publish-panel__link' })
						],
						className   : 'aioseo-pre-publish aioseo-seo-overview',
						initialOpen : true,
						icon        : wp.element.Fragment
					},
					wp.element.createElement(
						'div',
						{},
						wp.element.createElement('div', { id: 'aioseo-pre-publish' })
					)
				),
				wp.element.createElement(
					PluginPostPublishPanel,
					{
						title       : process.env.VUE_APP_SHORT_NAME,
						initialOpen : true,
						icon        : wp.element.Fragment
					},
					wp.element.createElement(
						'div',
						{},
						wp.element.createElement('div', { id: 'aioseo-post-publish' })
					)
				)
			)
		}
	})
})(window.wp)