const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'secret',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'secret',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: addThread.title,
        owner: addThread.owner,
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'Dicoding', created_at: '2023-10-23T19:40:16.238Z' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).resolves.not.toThrowError(NotFoundError);
      expect(thread).toEqual(new GetThread({
        id: 'thread-123',
        title: 'Dicoding',
        body: 'secret',
        created_at: '2023-10-23T12:40:16.238Z',
        username: 'dicoding',
      }));
    });
  });
});
