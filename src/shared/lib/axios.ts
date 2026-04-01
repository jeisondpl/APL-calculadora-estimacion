import axios, { type AxiosError } from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de request (ej: auth token en el futuro)
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Interceptor de response — normaliza errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ msg?: string }>) => {
    const msg =
      error.response?.data?.msg ??
      error.message ??
      'Error de red'
    return Promise.reject(new Error(msg))
  }
)
