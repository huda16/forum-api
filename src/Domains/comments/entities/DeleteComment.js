class DeleteComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, owner, threadId } = payload;

    this.commentId = commentId;
    this.owner = owner;
    this.threadId = threadId;
  }

  _verifyPayload({ commentId, owner, threadId}) {
    if (!commentId || !owner || !threadId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;
