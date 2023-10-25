const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner, replyId } = useCasePayload;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.getCommentById(commentId);
    await this._replyRepository.verifyReplyOwner(replyId, owner)
    return this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
