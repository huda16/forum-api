const UserRepository = require('../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeUseCase = require('../LikeUseCase');

describe('LikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockUserRepository.verifyUserAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailability = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith('comment-123');
    expect(mockUserRepository.verifyUserAvailability).toBeCalledWith('user-123');
    expect(mockLikeRepository.verifyLikeAvailability).toBeCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.addLike).toBeCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.deleteLike).toBeCalledTimes(0);
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockUserRepository.verifyUserAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailability = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith('comment-123');
    expect(mockUserRepository.verifyUserAvailability).toBeCalledWith('user-123');
    expect(mockLikeRepository.verifyLikeAvailability).toBeCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.deleteLike).toBeCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.addLike).toBeCalledTimes(0);
  });
});
