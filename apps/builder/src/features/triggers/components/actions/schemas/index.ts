import { addTags } from "./add-tags"
import { clearCustomField } from "./clear-custom-field"
import { removeTags } from "./remove-tags"
import { replyToComment } from "./reply-to-comment"
import { runGoogleSheet } from "./run-google-sheet"
import { sendPrivateReplyToComment } from "./send-private-reply-to-comment"
import { setCustomField } from "./set-custom-field"
import { startFlow } from "./start-flow"
import { transferConversationToHuman } from "./transfer-conversation-to-human"

export const allActions = {
  addTags,
  removeTags,
  replyToComment,
  sendPrivateReplyToComment,
  setCustomField,
  clearCustomField,
  startFlow,
  transferConversationToHuman,
  runGoogleSheet,
}
