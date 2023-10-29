class GetComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, created_at, username, is_delete: isDelete,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.date = created_at;
    this.username = username;
  }

  _verifyPayload(payload) {
    const {
      id, content, created_at, username, is_delete: isDelete,
    } = payload;

    if (!id || !content || !created_at || !username || isDelete === undefined) {
      throw new Error('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof created_at !== 'string' || typeof username !== 'string' || typeof isDelete !== 'boolean') {
      throw new Error('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetComment;
