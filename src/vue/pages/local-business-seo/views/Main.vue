<template>
	<div class="aioseo-app">
		<core-main-tabs
			:tabs="tabs"
			:showSaveButton="false"
			:active="tab"
			internal
			disableMobile
			@changed="value => processChangeTab(value)"
		/>
		<transition name="route-fade" mode="out-in">
			<component
				:is="tab"
			/>
		</transition>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import BusinessInfo from './BusinessInfo'
import OpeningHours from './OpeningHours'
import Maps from './Maps'
export default {
	components : {
		BusinessInfo,
		OpeningHours,
		Maps
	},
	watch : {
		currentPost : {
			deep : true,
			handler () {
				this.savePostState()
			}
		}
	},
	data () {
		return {
			tab  : 'business-info',
			tabs : [
				{
					slug : 'business-info',
					icon : 'svg-settings',
					name : this.$t.__('Business Info', this.$td)
				},
				{
					slug : 'opening-hours',
					icon : 'svg-settings',
					name : this.$t.__('Opening Hours', this.$td)
				},
				{
					slug : 'maps',
					icon : 'svg-settings',
					name : this.$t.__('Maps', this.$td)
				}
			]
		}
	},
	computed : {
		...mapState([ 'currentPost' ])
	},
	methods : {
		...mapActions([ 'savePostState' ]),
		processChangeTab (newTabValue) {
			this.tab = newTabValue
		}
	}
}
</script>