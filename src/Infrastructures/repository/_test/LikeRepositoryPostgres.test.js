const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Assert
      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(1);
    });

    it('should get like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Assert
      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like[0].id).toEqual('like-123');
      expect(like[0].owner).toEqual('user-123');
      expect(like[0].owner).toEqual('user-123');
    });
  });

  describe('deleteLike function', () => {
    it('should throw NotFoundError when like not found', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.deleteLike('user-234', 'comment-234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when a like is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await LikesTableTestHelper.addLike({ id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.deleteLike('user-123', 'comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyLikeAvailability function', () => {
    it('should return false when a like not found', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const like = await likeRepositoryPostgres.verifyLikeAvailability('user-234', 'comment-234');
      expect(like).toEqual(false);
    });

    it('should return true when a like is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
      await CommentsTableTestHelper.addComment({ content: 'dicoding' });
      await LikesTableTestHelper.addLike({ id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const like = await likeRepositoryPostgres.verifyLikeAvailability('user-123', 'comment-123');
      expect(like).toEqual(true);
    });
  });
});
