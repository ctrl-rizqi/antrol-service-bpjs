import axios from 'axios'

const API = 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API,
})
