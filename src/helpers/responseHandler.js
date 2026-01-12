export function handleSuccess(res, data, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  })
}

export function handleError(next, err) {
  next(err)
}