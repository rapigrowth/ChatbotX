import { deleteComment, editComment, hideComment, likeComment } from "./actions"
import { sendComment, sendPrivateReply } from "./outgoing-comment"

export const commentHandlers = {
  sendComment,
  sendPrivateReply,
  editComment,
  deleteComment,
  likeComment,
  hideComment,
}
