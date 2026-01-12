export function handleSuccess(res, data, message = 'Operation successful', statusCode = 200) {
  const response = {
    status: 'success',
    message
  }
  
  if (data !== undefined && data !== null) {
    response.data = data
  }

  return res.status(statusCode).json(response)
}

export function handleError(next, err) {
  next(err)
}