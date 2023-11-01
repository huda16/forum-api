const GetLike = require('../GetLike');

describe('a GetLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'dicoding',
      commentId: '2023',
    };

    // Action and Assert
    expect(() => new GetLike(payload)).toThrowError('GET_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      commentId: 'false',
      owner: ['dicoding'],
    };

    // Action and Assert
    expect(() => new GetLike(payload)).toThrowError('GET_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetLike object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const getLike = new GetLike(payload);

    // Assert
    expect(getLike.threadId).toEqual(payload.threadId);
    expect(getLike.commentId).toEqual(payload.commentId);
    expect(getLike.owner).toEqual(payload.owner);
  });
});
