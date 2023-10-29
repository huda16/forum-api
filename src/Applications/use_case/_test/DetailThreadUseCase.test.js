const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetReply = require('../../../Domains/replies/entities/GetReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should orchestrating the detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };
    const date = new Date().toISOString();

    const mockThread = new GetThread({
      id: 'thread-123',
      title: 'Dicoding',
      body: 'dicoding',
      created_at: date,
      username: 'dicoding',
    });

    const mockCommentOne = new GetComment({
      id: 'comment-123',
      username: 'dicoding',
      created_at: date,
      content: 'dicoding',
      is_delete: true,
    });

    const mockCommentTwo = new GetComment({
      id: 'comment-234',
      username: 'dicoding',
      created_at: date,
      content: 'dicoding',
      is_delete: false,
    });

    const mockReply = new GetReply({
      id: 'reply-123',
      username: 'dicoding',
      created_at: date,
      content: 'dicoding',
      is_delete: false,
      comment_id: 'comment-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      mockCommentOne, mockCommentTwo,
    ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve([mockReply]));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
    expect(detailThread).toEqual(new DetailThread({
      thread: {
        id: 'thread-123',
        title: 'Dicoding',
        body: 'dicoding',
        date,
        username: 'dicoding',
      },
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date,
          content: '**komentar telah dihapus**',
        },
        {
          id: 'comment-234',
          username: 'dicoding',
          date,
          content: 'dicoding',
        },
      ],
      replies: [
        {
          id: 'reply-123',
          username: 'dicoding',
          created_at: date,
          content: 'dicoding',
          is_delete: false,
          comment_id: 'comment-123',
        },
      ],
    }));
  });
});
