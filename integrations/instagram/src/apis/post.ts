import type { Context } from "@chatbotx.io/sdk"
import { DEFAULT_API_VERSION } from "../constants"
import { rescue } from "../exception"
import { instagramBusinessClient } from "../lib/http-client"
import type { InstagramAuthValue } from "../schemas"

export type InstagramMediaDetails = {
  id?: string
  caption?: string
  media_url?: string
  thumbnail_url?: string
  timestamp: string
  permalink?: string
}

export type InstagramMediaList = {
  data: InstagramMediaDetails[]
}

export const listPosts = (props: {
  ctx: Context<InstagramAuthValue>
}): Promise<InstagramMediaList> => {
  const { ctx } = props
  const version = ctx.auth.metadata.version ?? DEFAULT_API_VERSION
  const endpoint = `${version}/${ctx.auth.metadata.igId}/media`

  return rescue(endpoint, () =>
    instagramBusinessClient.get<InstagramMediaList>(endpoint, {
      headers: {
        Authorization: `Bearer ${ctx.auth.tokens.accessToken}`,
      },
      searchParams: {
        fields: "id,caption,media_url,thumbnail_url,timestamp,permalink",
        limit: "50",
      },
    }),
  )
}

export const getPostDetails = (props: {
  ctx: Context<InstagramAuthValue>
  input: { postId: string }
}): Promise<InstagramMediaDetails> => {
  const { ctx, input } = props
  const version = ctx.auth.metadata.version ?? DEFAULT_API_VERSION
  const endpoint = `${version}/${input.postId}`

  return rescue(endpoint, () =>
    instagramBusinessClient.get<InstagramMediaDetails>(endpoint, {
      headers: {
        Authorization: `Bearer ${ctx.auth.tokens.accessToken}`,
      },
      searchParams: {
        fields: "caption,media_url,thumbnail_url,timestamp,permalink",
      },
    }),
  )
}
