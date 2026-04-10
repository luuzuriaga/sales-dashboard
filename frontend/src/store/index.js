import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000'

export default new Vuex.Store({
  state: {
    // Auth State
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    
    // Filter State
    trimestre: 'Q1',
    anio: '2025',
    
    // Data State
    salesData: [],
    users: [],
    reportData: null
  },

  getters: {
    isAuthenticated: state => !!state.token,
    userRole: state => state.user ? state.user.role : null,
    userName: state => state.user ? state.user.name : 'Invitado',

    currentData: (state) => {
      const summary = Array.isArray(state.salesData) 
        ? state.salesData.find(s => s.trimestre === state.trimestre) 
        : null;
      
      return {
        kpis: {
          total: summary ? summary.totalVentas : 0,
          orders: summary ? summary.orders : 0,
          ticket: summary ? summary.ticket : 0,
          metaPct: summary ? summary.metaPct : 0
        },
        vendedores: state.users.map(u => ({
          ...u,
          ventas: u.totalVentas || 0,
          meta: u.meta || 0
        }))
      }
    },
    
    kpis: (state, getters) => getters.currentData.kpis,
    vendedores: (state, getters) => getters.currentData.vendedores,

    vendedoresConEstado: (state, getters) =>
      getters.vendedores.map(v => ({
        ...v,
        pct: v.meta > 0 ? Math.round((v.ventas / v.meta) * 100) : 0,
        estado: v.ventas >= v.meta ? 'green' : v.ventas >= v.meta * 0.85 ? 'amber' : 'red'
      })),

    regiones: (state) => {
      if (!state.reportData) return []
      const regions = state.reportData.region || {}
      const total = Object.values(regions).reduce((a, b) => a + b, 0)
      return Object.entries(regions).map(([name, val]) => ({
        name,
        pct: total > 0 ? Math.round((val / total) * 100) : 0
      }))
    },

    chartData: (state) => {
      if (!state.reportData) return { months: [], ventas: [], metas: [] }
      const mensual = state.reportData.mensual || {}
      return {
        months: Object.keys(mensual),
        ventas: Object.values(mensual),
        metas: Object.keys(mensual).map(() => 45000)
      }
    },

    topVendedor: (state, getters) =>
      getters.vendedores.length > 0
        ? [...getters.vendedores].sort((a, b) => b.ventas - a.ventas)[0]
        : { name: '...', ventas: 0 }
  },

  mutations: {
    SET_AUTH(state, { user, token }) {
      state.user = user
      state.token = token
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    },
    LOGOUT(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    SET_TRIMESTRE(state, trimestre) {
      state.trimestre = trimestre
    },
    SET_ANIO(state, anio) {
      state.anio = anio
    },
    SET_SALES_DATA(state, data) {
      state.salesData = data
    },
    SET_USERS(state, users) {
      state.users = users
    },
    SET_REPORT_DATA(state, data) {
      state.reportData = data
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        commit('SET_AUTH', response.data)
        return response.data
      } catch (error) {
        const msg = error.response?.data?.error || 'Error al iniciar sesión'
        commit('SET_ERROR', msg)
        throw new Error(msg)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    logout({ commit }) {
      commit('LOGOUT')
    },

    async cambiarTrimestre({ commit, dispatch }, trimestre) {
      commit('SET_TRIMESTRE', trimestre)
      await Promise.all([
        dispatch('fetchUsers'),
        dispatch('fetchReportData')
      ])
    },

    async cambiarAnio({ commit, dispatch }, anio) {
      commit('SET_ANIO', anio)
      await Promise.all([
        dispatch('fetchSalesData'),
        dispatch('fetchUsers'),
        dispatch('fetchReportData')
      ])
    },

    async fetchSalesData({ commit, state }) {
      commit('SET_LOADING', true)
      try {
        const config = { 
          headers: { Authorization: `Bearer ${state.token}` },
          params: { anio: state.anio }
        }
        const endpoint = state.user.role === 'gerente' ? '/gerente/dashboard' : '/vendedor/rendimiento'
        const response = await axios.get(`${API_URL}${endpoint}`, config)
        commit('SET_SALES_DATA', response.data)
      } catch (error) {
        commit('SET_ERROR', 'Error al cargar datos del dashboard.')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchUsers({ commit, state }) {
      commit('SET_LOADING', true)
      try {
        const config = { 
          headers: { Authorization: `Bearer ${state.token}` },
          params: { trimestre: state.trimestre, anio: state.anio }
        }
        const endpoint = state.user.role === 'gerente' ? '/gerente/vendedores' : '/vendedor/perfil'
        const response = await axios.get(`${API_URL}${endpoint}`, config)
        const data = Array.isArray(response.data) ? response.data : [response.data]
        commit('SET_USERS', data)
      } catch (error) {
        commit('SET_ERROR', 'Error al cargar los vendedores.')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async agregarVenta({ commit, state }, saleData) {
      if (state.user.role !== 'vendedor') return
      commit('SET_LOADING', true)
      try {
        const config = { headers: { Authorization: `Bearer ${state.token}` } }
        await axios.post(`${API_URL}/vendedor/ventas`, saleData, config)
        return true
      } catch (error) {
        commit('SET_ERROR', 'Error al registrar la venta.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchReportData({ commit, state }) {
      if (state.user.role !== 'gerente') return
      commit('SET_LOADING', true)
      try {
        const config = { 
          headers: { Authorization: `Bearer ${state.token}` },
          params: { trimestre: state.trimestre, anio: state.anio }
        }
        const response = await axios.get(`${API_URL}/gerente/reportes`, config)
        commit('SET_REPORT_DATA', response.data)
      } catch (error) {
        commit('SET_ERROR', 'Error al cargar reportes detallados.')
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
})
