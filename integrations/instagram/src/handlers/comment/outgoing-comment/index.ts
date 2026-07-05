import {
  ChannelError,
  ChannelErrorCategory,
  type CommentHandlers,
} from "@chatbotx.io/sdk"
import {
  sendComment as sendCommentApi,
  sendPrivateReply as sendPrivateReplyApi,
} from "../../../apis/comment"
import { mapToChannelError } from "../../../lib/error-mapper"
import { logger } from "../../../lib/logger"
import type { InstagramAuthValue } from "../../../schemas"

export const sendComment: CommentHandlers<InstagramAuthValue>["sendComment"] =
  async (props) => {
    const {
      ctx,
      data: { message },
    } = props

    const replyToCommentId = message.contentAttributes?.replyToCommentId
    if (typeof replyToCommentId !== "string") {
      throw new ChannelError(
        "Cannot send comment reply: replyToCommentId is missing. The outgoing message must be linked to a parent comment.",
        ChannelErrorCategory.PAYLOAD_INVALID,
      )
    }

    if (!message.text) {
      logger.warn(
        { replyToCommentId },
        "sendComment: message has no text — skipping API call",
      )
      return { messageIds: [] }
    }

    try {
      const result = await sendCommentApi(
        ctx.auth,
        replyToCommentId,
        message.text,
      )
      return { messageIds: result.id ? [result.id] : [] }
    } catch (error) {
      logger.error(error, "An error occurred while sending the comment reply")
      throw mapToChannelError(error)
    }
  }

export const sendPrivateReply: CommentHandlers<InstagramAuthValue>["sendPrivateReply"] =
  async ({ ctx, data }) => {
    const message = data.message.trim()
    if (!message) {
      throw new ChannelError(
        "Cannot send private reply: message is empty.",
        ChannelErrorCategory.PAYLOAD_INVALID,
      )
    }

    try {
      const result = await sendPrivateReplyApi(
        ctx.auth,
        data.commentId,
        message,
      )
      return { messageIds: result.message_id ? [result.message_id] : [] }
    } catch (error) {
      logger.error(error, "An error occurred while sending the private reply")
      throw mapToChannelError(error)
    }
  }
