const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
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
      const replyRequestPayload = {
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
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
        content: 'ipsum',
      };
      const replyRequestPayload = {
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
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
        content: 'lorem ipsum',
      };
      const replyRequestPayload = {
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
      const commentId = response.result.data.addedComment.id;

      // Action
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const replyRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: replyRequestPayload,
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
      const replyRequestPayload = {
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
        url: '/threads/xxxx/comments/comment-123/replies',
        payload: replyRequestPayload,
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

    it('should response 404 when thread not exists', async () => {
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
      const replyRequestPayload = {
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

      // Action
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/xxxx/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 200 and delete reply', async () => {
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
      const replyRequestPayload = {
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
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyId = response.result.data.addedReply.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(replyId);
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(reply[0].is_delete).toEqual(true);
    });

    it('should response 401 without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when user not owned reply', async () => {
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
      const replyRequestPayload = {
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
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyId = response.result.data.addedReply.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
      const replyRequestPayload = {
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
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyId = response.result.data.addedReply.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxxx/comments/${commentId}/replies/${replyId}`,
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
      const commentRequestPayload = {
        content: 'Lorem ipsum site dolor',
      };
      const replyRequestPayload = {
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
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyId = response.result.data.addedReply.id;

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxxx/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
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
      const replyRequestPayload = {
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
      response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyRequestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/xxxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan gagal dihapus. Id tidak ditemukan');
    });
  });
});
