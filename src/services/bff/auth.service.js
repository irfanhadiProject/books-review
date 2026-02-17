import coreApiClient from './coreApi.client.js'

export async function login(payload) {
  return await coreApiClient.post('/auth/login', payload)
}

export async function logout(cookie) {
  return await coreApiClient.post('/auth/logout', {} , {
    headers: {
      cookie
    }
  })
}