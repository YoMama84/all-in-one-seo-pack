import { __, sprintf } from '@wordpress/i18n'

(function (wp) {
	if ('undefined' === typeof wp || 'undefined' === typeof wp.blocks) {
		return
	}

	if ('object' === typeof wp.blocks.getBlockType('aioseo/breadcrumbs')) {
		return
	}

	if (window.aioseo.currentPost) {
		const el = wp.element.createElement
		const Fragment = wp.element.Fragment
		const ServerSideRender = wp.serverSideRender || wp.components.ServerSideRender
		const td = process.env.VUE_APP_TEXTDOMAIN
		const icon = el('svg',
			{
				width   : 24,
				height  : 25,
				viewBox : '0 0 24 25',
				xmlns   : 'http://www.w3.org/2000/svg'
			},
			el('path',
				{
					d : 'M1.7002 5.31067H10.8705L17.8705 12.5L10.8705 19.6893H1.7002V5.31067ZM10.2856 12.4999C10.2856 13.3284 9.61396 14.0001 8.7854 14.0001C7.95684 14.0001 7.28516 13.3284 7.28516 12.4999C7.28516 11.6713 7.95684 10.9996 8.7854 10.9996C9.61396 10.9996 10.2856 11.6713 10.2856 12.4999ZM6.1933 12.5001C6.1933 13.195 5.62995 13.7584 4.93503 13.7584C4.2401 13.7584 3.67676 13.195 3.67676 12.5001C3.67676 11.8052 4.2401 11.2418 4.93503 11.2418C5.62995 11.2418 6.1933 11.8052 6.1933 12.5001ZM12.6342 13.7584C13.3292 13.7584 13.8925 13.195 13.8925 12.5001C13.8925 11.8052 13.3292 11.2418 12.6342 11.2418C11.9393 11.2418 11.376 11.8052 11.376 12.5001C11.376 13.195 11.9393 13.7584 12.6342 13.7584ZM15.3002 5.31067H12.5771L19.5771 12.5L12.5771 19.6893H15.3002L22.3002 12.5L15.3002 5.31067Z'
				}
			)
		)

		wp.blocks.registerBlockType('aioseo/breadcrumbs', {
			// Translators: 1 - AIOSEO.
			title      : sprintf(__('%1$s - Breadcrumbs', td), process.env.VUE_APP_SHORT_NAME),
			category   : 'aioseo',
			icon       : icon,
			example    : {},
			attributes : {},
			edit       : function () {
				return el(Fragment, {},
					el(
						'div',
						{},
						[
							el(
								ServerSideRender,
								{
									block      : 'aioseo/breadcrumbs',
									attributes : {}
								}
							)
						]
					)
				)
			},
			save : function () {
				return null
			}
		})
	}
})(
	window.wp
)