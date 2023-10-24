const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      // Action
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const commentRequestPayload = {
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      // Action
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const commentRequestPayload = {
        content: ['lorem ipsum'],
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      // Action
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          threadId,
          ...commentRequestPayload,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: commentRequestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not exists', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;

      // Action
      response = await server.inject({
        method: 'POST',
        url: '/threads/xxxx/comments',
        payload: commentRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments', () => {
    it('should response 200 and delete comment', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = response.result.data.addedComment.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(comment[0].is_delete).toBe(true);
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: commentRequestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when user not owned comment', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const requestPayloadTwo = {
        username: 'dicodingtwo',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingtwo',
          password: 'secret',
          fullname: 'Dicoding Indonesia Two',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayloadTwo,
      });
      const accessTokenTwo = response.result.data.accessToken;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = response.result.data.addedComment.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenTwo}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = response.result.data.addedComment.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxxx/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadRequestPayload = {
        title: 'Lorem',
        body: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);
      // add user
      let response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login & get token
      response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = response.result.data;
      // add thread
      response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadId = response.result.data.addedThread.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar gagal dihapus. Id tidak ditemukan');
    });
  });
});
