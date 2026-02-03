import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL: API,
})
