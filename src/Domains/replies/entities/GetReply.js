class GetReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, created_at, username, comment_id, is_delete: isDelete } = payload;

    this.id = id;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.created_at = created_at;
    this.username = username;
    this.comment_id = comment_id;
  }

  _verifyPayload(payload) {
    const { id, content, created_at, username, comment_id, is_delete: isDelete } = payload;

    if (!id || !content || !created_at || !username || !comment_id || isDelete === undefined) {
      throw new Error('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof created_at !== 'string' || typeof username !== 'string' || typeof comment_id !== 'string' || typeof isDelete !== 'boolean') {
      throw new Error('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetReply;