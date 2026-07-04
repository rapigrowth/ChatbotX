import { triggerActions } from "@chatbotx.io/database/partials"
import z from "zod"

export const replyToComment = z.object({
  type: z.literal(triggerActions.enum.replyToComment),
  text: z.string().min(1, "Required"),
})
export type ReplyToComment = z.infer<typeof replyToComment>

export const defaultFn = (): ReplyToComment => ({
  type: triggerActions.enum.replyToComment,
  text: "",
})
