import { mapGetters } from 'vuex'
export const AccessControl = {
	data () {
		return {
			roles : [
				{
					label       : this.$t.__('Administrator', this.$td),
					name        : 'administrator',
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag.
					description : this.$t.sprintf(this.$t.__('By default Admins have access to %1$sall SEO site settings%2$s', this.$td), '<strong>', '</strong>')
				},
				{
					label       : this.$t.__('Editor', this.$td),
					name        : 'editor',
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag.
					description : this.$t.sprintf(this.$t.__('By default Editors have access to %1$sSEO settings for General Settings, Search Appearance and Social Networks, as well as all settings for individual pages and posts.%2$s', this.$td), '<strong>', '</strong>')
				},
				{
					label       : this.$t.__('Author', this.$td),
					name        : 'author',
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag.
					description : this.$t.sprintf(this.$t.__('By default Authors have access to %1$sSEO settings for individual pages and posts that they already have permission to edit.%2$s', this.$td), '<strong>', '</strong>')
				},
				{
					label       : this.$t.__('Contributor', this.$td),
					name        : 'contributor',
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag.
					description : this.$t.sprintf(this.$t.__('By default Contributors have access to %1$sSEO settings for individual pages and posts that they already have permission to edit.%2$s', this.$td), '<strong>', '</strong>')
				},
				{
					label       : this.$t.__('SEO Manager', this.$td),
					name        : 'seoManager',
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag.
					description : this.$t.sprintf(this.$t.__('By default SEO Managers have access to %1$sSEO settings for General Settings, Redirections, and individual pages and posts.%2$s', this.$td), '<strong>', '</strong>')
				},
				{
					label       : this.$t.__('SEO Editor', this.$td),
					name        : 'seoEditor',
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag.
					description : this.$t.sprintf(this.$t.__('By default SEO Editors have access to %1$sSEO settings for individual pages and posts.%2$s', this.$td), '<strong>', '</strong>')
				}
			],
			strings : {
				// Translators: 1 - The plugin name ("All in One SEO")
				tooltip            : this.$t.sprintf(this.$t.__('By default, only users with an Administrator role have permission to manage %1$s within your WordPress admin area. With Access Controls, though, you can easily extend specific access permissions to other user roles.', this.$td), process.env.VUE_APP_NAME),
				accessControl      : this.$t.__('Access Control Settings', this.$td),
				useDefaultSettings : this.$t.__('Use Default Settings', this.$td)
			}
		}
	},
	computed : {
		...mapGetters([ 'settings' ]),
		getRoles () {
			return this.roles.concat(Object.keys(this.$aioseo.user.customRoles).map(role => ({
				label       : this.$aioseo.user.roles[role],
				name        : role,
				description : this.$t.sprintf(this.$t.__('By default the %1$s role %2$shas no access%3$s to %4$s settings.', this.$td), this.$aioseo.user.roles[role], '<strong>', '</strong>', process.env.VUE_APP_NAME),
				dynamic     : true
			})))
		}
	}
}