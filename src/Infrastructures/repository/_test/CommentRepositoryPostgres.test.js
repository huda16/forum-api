const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const GetComment = require('../../../Domains/comments/entities/GetComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'dicoding',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'dicoding',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addComment.content,
        owner: addComment.owner,
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-123'))
        .rejects.toThrowError(NotFoundError);
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment[0]).toBeUndefined();
    });

    it('should delete a comment using soft delete', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should not throw an error when a comment is owned by the user owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when a comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-234', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when a comment is not owned by the user owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-234'))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const commentRepository = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(commentRepository).toEqual([]);
    });

    it('should return comments correctly', async () => {
      // Arrange
      const createdAt = '2023-10-23T05:36:42.192Z';
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding', createdAt });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const commentRepository = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(commentRepository.length).toBe(1);
      expect(commentRepository[0]).toEqual(new GetComment({
        id: 'comment-123',
        content: 'dicoding',
        created_at: createdAt,
        username: 'dicoding',
        is_delete: false,
      }));
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when a comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when a comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });
});
