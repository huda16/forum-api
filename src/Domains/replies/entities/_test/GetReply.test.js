const GetReply = require('../GetReply');

describe('a GetReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'dicoding',
      created_at: '2023',
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'dicoding',
      created_at: {},
      username: ['dicoding'],
      comment_id: 'false',
      is_delete: ['dicoding'],
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'dicoding',
      created_at: new Date().toISOString(),
      username: 'dicoding',
      comment_id: 'comment-123',
      is_delete: false,
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.content).toEqual(payload.content);
    expect(getReply.date).toEqual(payload.date);
    expect(getReply.username).toEqual(payload.username);
    expect(getReply.comment_id).toEqual(payload.comment_id);
  });

  it('should create GetReply object correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'dicoding',
      created_at: new Date().toISOString(),
      username: 'dicoding',
      comment_id: 'comment-123',
      is_delete: true,
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.content).toEqual('**balasan telah dihapus**');
    expect(getReply.date).toEqual(payload.date);
    expect(getReply.username).toEqual(payload.username);
    expect(getReply.comment_id).toEqual(payload.comment_id);
  });
});
