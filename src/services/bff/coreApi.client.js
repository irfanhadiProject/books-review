import axios from 'axios'

const coreApiClient = axios.create({
  baseURL: process.env.CORE_API_BASE_URL,
  withCredentials: true,
  timeout: 5000
})

coreApiClient.interceptors.request.use(
  (config) => {
    console.log(
      `[CoreAPI] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    )
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

coreApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'Core API error',
        data: error.response.data
      })
    }

    if (error.request) {
      return Promise.reject({
        status: 503,
        message: 'Core API not reachable'
      })
    }

    return Promise.reject({
      status: 500,
      message: 'Unexpected error in Core API client'
    })
  }
)

export default coreApiClient