async function doFetchCover({bookId, isbn}) {
  console.log(`Fetching cover for bookId=${bookId}, ISBN=${isbn}...`)

  return true
}

export async function fetchCoverAsync(payload) {
  Promise.resolve()
  .then(() => doFetchCover(payload))
  .catch(err => {
    console.error('[cover-fetch-failed]', payload, err.message)
  })
}