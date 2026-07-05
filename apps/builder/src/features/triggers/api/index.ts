import { triggersCommentPostAPIs } from "./comment-posts"
import triggersWorkspaceTokenAPIs from "./workspace-token"

export const triggersAPI = {
  ...triggersWorkspaceTokenAPIs,
  ...triggersCommentPostAPIs,
}
