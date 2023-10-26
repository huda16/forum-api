const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'dicoding',
      owner: 'user-123'
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'dicoding',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith('comment-123');
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'dicoding',
    }));

    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      commentId: useCasePayload.commentId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
