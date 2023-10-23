const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const GetComment = require('../../Domains/comments/entities/GetComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { threadId, content, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, threadId, isDelete, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(id) {
    const isDelete = true;
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE comments SET is_delete = $2, deleted_at = $3 WHERE id = $1',
      values: [id, isDelete, deletedAt],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) throw new NotFoundError('Komentar gagal dihapus. Id tidak ditemukan');
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE is_delete = false AND id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) throw new NotFoundError('Komentar gagal dihapus. Id tidak ditemukan');


    const comment = result.rows[0];
    if (comment.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, users.username, comments.is_delete, comments.created_at
          FROM comments
          LEFT JOIN users ON comments.owner = users.id
          WHERE comments.thread_id = $1 GROUP BY comments.id, users.username ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const results = await this._pool.query(query);

    return results.rows.map((result) => {
      const payload = {
        id: result.id,
        content: result.content,
        created_at: result.created_at.toISOString(),
        username: result.username,
        is_delete: result.is_delete
      };
      return new GetComment(payload);
    });
  }

  async getCommentById(id) {
    const query = {
      text: `SELECT * FROM comments WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Komentar tidak ditemukan');

    return result.rows[0];
  }
}

module.exports = CommentRepositoryPostgres;
