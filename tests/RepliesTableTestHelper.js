/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'dicoding', owner = 'user-123', commentId = 'comment-123', isDelete = false, createdAt = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, commentId, isDelete, createdAt],
    };

    await pool.query(query);
  },

  async addReplyWhenDelete({
    id = 'reply-123', content = 'dicoding', owner = 'user-123', commentId = 'comment-123', isDelete = true, createdAt = new Date().toISOString(),
  }) {
    await this.addReply({
      id, content, owner, commentId, isDelete, createdAt,
    });
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
