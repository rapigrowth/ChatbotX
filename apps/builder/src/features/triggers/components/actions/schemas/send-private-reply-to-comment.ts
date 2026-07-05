import { triggerActions } from "@chatbotx.io/database/partials"
import z from "zod"

export const sendPrivateReplyToComment = z.object({
  type: z.literal(triggerActions.enum.sendPrivateReplyToComment),
  text: z.string().min(1, "Required"),
})
export type SendPrivateReplyToComment = z.infer<
  typeof sendPrivateReplyToComment
>

export const defaultFn = (): SendPrivateReplyToComment => ({
  type: triggerActions.enum.sendPrivateReplyToComment,
  text: "",
})
