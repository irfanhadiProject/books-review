import coreApiClient from './coreApi.client.js'

export async function login(payload) {
  return await coreApiClient.post('/auth/login', payload)
}