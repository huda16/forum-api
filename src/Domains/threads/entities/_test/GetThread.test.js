const GetThread = require('../GetThread');

describe('a GetThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: true,
      username: {},
      created_at: '2023',
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Dicoding',
      body: 'Dicoding Indonesia',
      username: 'user-123',
      created_at: new Date().toISOString(),
    };

    // Action
    const { id, title, body, username, date } = new GetThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.created_at);
  });
});
