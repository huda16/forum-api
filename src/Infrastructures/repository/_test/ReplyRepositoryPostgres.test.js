const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const GetReply = require('../../../Domains/replies/entities/GetReply');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const addReply = new AddReply({
        commentId: 'comment-123',
        content: 'dicoding',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const addReply = new AddReply({
        commentId: 'comment-123',
        content: 'dicoding',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: addReply.content,
        owner: addReply.owner,
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.deleteReply('reply-123'))
        .rejects.toThrowError(NotFoundError);
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply[0]).toBeUndefined();
    });

    it('should delete a reply using soft delete', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await RepliesTableTestHelper.addReply({ content: 'dicoding' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
      expect(reply[0].is_delete).toEqual(true);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should not throw an error when a reply is owned by the user owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await RepliesTableTestHelper.addReply({ content: 'dicoding' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when a reply not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await RepliesTableTestHelper.addReply({ content: 'dicoding' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-234', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when a reply is not owned by the user owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await RepliesTableTestHelper.addReply({ content: 'dicoding' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-234'))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return empty replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replyRepository = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replyRepository).toEqual([]);
    });

    it('should return replies correctly', async () => {
      // Arrange
      const createdAt = '2023-10-23T05:36:42.192Z';
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await RepliesTableTestHelper.addReply({ content: 'dicoding', createdAt });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replyRepository = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replyRepository.length).toBe(1);
      expect(replyRepository[0]).toEqual(new GetReply({
        id: 'reply-123',
        content: 'dicoding',
        created_at: createdAt,
        username: 'dicoding',
        comment_id: 'comment-123',
        is_delete: false,
      }));
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when a reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when a reply is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await RepliesTableTestHelper.addReply({ content: 'dicoding' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });
});
