import Vue from 'vue'
import SvgIcons from '@/components/svgIcons'

Vue.component('svg-icon', SvgIcons)

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)