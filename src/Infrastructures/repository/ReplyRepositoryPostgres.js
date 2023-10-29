const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const GetReply = require('../../Domains/replies/entities/GetReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { commentId, content, owner } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, commentId, isDelete, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async deleteReply(id) {
    const isDelete = true;
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE replies SET is_delete = $2, deleted_at = $3 WHERE id = $1',
      values: [id, isDelete, deletedAt],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) throw new NotFoundError('Balasan gagal dihapus. Id tidak ditemukan');
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE is_delete = false AND id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) throw new NotFoundError('Balasan gagal dihapus. Id tidak ditemukan');

    const reply = result.rows[0];
    if (reply.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.comment_id, replies.created_at, replies.content, replies.is_delete, users.username 
          FROM replies
          LEFT JOIN users ON users.id = replies.owner 
          LEFT JOIN comments ON comments.id = replies.comment_id 
          WHERE comments.thread_id = $1 ORDER BY replies.created_at ASC`,
      values: [threadId],
    };

    const results = await this._pool.query(query);

    return results.rows.map((result) => {
      const payload = {
        id: result.id,
        content: result.content,
        created_at: result.created_at.toISOString(),
        username: result.username,
        comment_id: result.comment_id,
        is_delete: result.is_delete,
      };
      return new GetReply(payload);
    });
  }

  async verifyReplyAvailability(id) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Balasan tidak ditemukan');
  }
}

module.exports = ReplyRepositoryPostgres;
