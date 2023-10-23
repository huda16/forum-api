const GetComment = require('../GetComment');

describe('a GetComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'dicoding',
      created_at: '2023',
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'dicoding',
      created_at: {},
      username: ['dicoding'],
      is_delete: ['dicoding'],
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'dicoding',
      created_at: new Date().toISOString(),
      username: 'dicoding',
      is_delete: false
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.content).toEqual(payload.content);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.username).toEqual(payload.username);
  });

  it('should create GetComment object correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'dicoding',
      created_at: new Date().toISOString(),
      username: 'dicoding',
      is_delete: true
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.content).toEqual('**komentar telah dihapus**');
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.username).toEqual(payload.username);
  });
});
