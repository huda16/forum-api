const GetThread = require('./GetThread');

class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    payload.thread.created_at = payload.thread.date;
    this.thread = new GetThread(payload.thread);
    this.thread.comments = payload.comments.map((comment) => {
      const replies = payload.replies.filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.content,
          date: reply.created_at,
          username: reply.username,
        }));
      comment.replies = replies;
      return comment;
    });
  }

  _verifyPayload(payload) {
    const { thread, comments, replies } = payload;

    if (!thread || !comments || !replies) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof thread !== 'object' || !Array.isArray(comments) || !Array.isArray(replies)) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailThread;