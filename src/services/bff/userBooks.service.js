import coreApiClient from './coreApi.client.js'

export async function getUserBooks(cookie) {
  const response = await coreApiClient.get('/user-books', {
    headers: {
      cookie
    }
  })

  const data = response.data
  return {
    books: data.data,
    total: data.meta.total
  }
}

export async function createUserBook(payload, cookie) {
  await coreApiClient.post('/user-books', payload, {
    headers: {
      cookie
    }
  })
}

export async function updateUserBook(id, payload, cookie) {
  const response = await coreApiClient.put(`/user-books/${id}`, payload,
    {
      headers: { cookie }
    }
  )
  
  return response.data
}

export async function deleteUserBook(id, cookie) {
  const response = await coreApiClient.delete(`/user-books/${id}`, 
    {
      headers: { cookie }
    }
  )
  
  return response.data
}