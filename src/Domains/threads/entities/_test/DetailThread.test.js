const GetComment = require('../../../comments/entities/GetComment');
const GetReply = require('../../../replies/entities/GetReply');
const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      thread: {
        id: 'thread-123',
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
        created_at: new Date().toISOString(),
        username: 'dicoding',
      },
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      thread: {
        id: 'thread-123',
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
        created_at: new Date().toISOString(),
        username: 'dicoding',
      },
      comments: 'this is comment',
      replies: [],
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread entities correctly', () => {
    // Arrange
    const date = new Date().toISOString();
    const payload = {
      thread: {
        id: 'thread-123',
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
        date: date,
        username: 'dicoding',
      },
      comments: [
        new GetComment({
          id: 'comment-123',
          username: 'dicoding',
          created_at: date,
          content: 'dicoding',
          is_delete: false,
        }),
      ],
      replies: [
        new GetReply({
          id: 'reply-123',
          username: 'dicoding',
          created_at: date,
          content: 'dicoding',
          is_delete: false,
          comment_id: 'comment-123',
        }),
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.thread.id).toEqual(payload.thread.id);
    expect(detailThread.thread.title).toEqual(payload.thread.title);
    expect(detailThread.thread.body).toEqual(payload.thread.body);
    expect(detailThread.thread.date).toEqual(payload.thread.date);
    expect(detailThread.thread.username).toEqual(payload.thread.username);
    expect(detailThread.thread.comments).toEqual([
      {
        id: 'comment-123',
        username: 'dicoding',
        date,
        content: 'dicoding',
        replies: [
          {
            id: 'reply-123',
            username: 'dicoding',
            date,
            content: 'dicoding',
          },
        ],
      },
    ]);
    expect(detailThread.thread.comments[0].replies).toEqual([
      {
        id: 'reply-123',
        username: 'dicoding',
        date,
        content: 'dicoding',
      },
    ]);
  });
});
