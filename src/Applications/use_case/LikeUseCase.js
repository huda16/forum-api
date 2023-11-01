const GetLike = require('../../Domains/likes/entities/GetLike');

class LikeUseCase {
  constructor({
    threadRepository, commentRepository, userRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = new GetLike(useCasePayload);
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._userRepository.verifyUserAvailability(owner);
    const isAvailable = await this._likeRepository.verifyLikeAvailability(owner, commentId);
    if (isAvailable) {
      await this._likeRepository.deleteLike(owner, commentId);
      return;
    }

    await this._likeRepository.addLike(owner, commentId);
  }
}

module.exports = LikeUseCase;
