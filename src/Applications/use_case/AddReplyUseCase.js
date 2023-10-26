const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId } = useCasePayload;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    const addReply = new AddReply(useCasePayload);
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
