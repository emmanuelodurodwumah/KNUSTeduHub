import axios from "axios"
import useAuthStore from "./authStore"

const api = axios.create({
    // baseURL: 'https://evoting-studies.onrender.com/api/',
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

export default api