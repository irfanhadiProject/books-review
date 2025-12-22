/**
 * Domain Service: Book Collection
 * 
 * Tanggung jawab:
 * - Menjaga invariant relasi user <-> book
 * - Menyediakan operasi atomik (transactional)
 * 
 * Service ini Tidak:
 * - Tahu HTTP
 * - Tahu session
 * - Tahu view / redirect
 */

/**
 * addBookToUserCollection
 * 
 * Invariants:
 * 1. userId valid
 * 2. title tidak boleh kosong
 * 3. satu user hanya boleh punya satu relasi ke satu buku
 * 4. tidak boleh ada state setengah jadi:
 *    - books sukses tapi user_books gagal -> rollback
 * 5. ISBN opsional: 
 *    - jika ada, jadi identitas deduplikasi utama
 *    - jika tidak ada, deduplikasi best effort (title + author)
 * 6. Fetch cover tidak mempengaruhi keberhasilan utama
 * 
 * Input:
 * {
 *  userId: string | number,
 *  title: string,
 *  author?: string,
 *  isbn?: string,
 *  summary?: string, 
 * }
 * 
 * Output (success):
 * {
 *  bookId: string | number,
 *  userBookId: string | number
 * }
 * 
 * Errors (domain-level):
 * - ValidationError
 * - UserAlreadyHasBookError
 * - NotFoundError
 * - DatabaseError
 */

async function addBookToUserCollection(input) {
  // TODO:
  // 1. validate input.title
  // 2. begin transaction
  // 3. find or create book
  // 4. create user_books relation
  // 5. commit transaction
  // 6. trigger cover fetch (non-blocking)
  // 7. return ids
}

module.exports = { 
  addBookToUserCollection,
}