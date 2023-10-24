class GetThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, username, created_at } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.username = username;
    this.date = created_at;
  }

  _verifyPayload(payload) {
    const { id, title, body, username, created_at } = payload;
    if (!id || !title || !body || !username || !created_at) {
      throw new Error('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof body !== 'string' || typeof username !== 'string' || typeof created_at !== 'string') {
      throw new Error('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThread;
