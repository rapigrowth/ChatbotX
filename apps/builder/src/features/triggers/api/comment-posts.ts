import { buildContext } from "@chatbotx.io/business"
import type { InstagramAuthValue } from "@chatbotx.io/integration-instagram"
import type { MessengerAuthValue } from "@chatbotx.io/integration-messenger/schema"
import z from "zod"
import { listIntegrationInstagrams } from "@/features/integration-instagram/queries"
import { listIntegrationMessengers } from "@/features/integration-messenger/queries"
import { integrations } from "@/integration"
import { workspaceAuthorizedMidddleware } from "@/middlewares/auth"
import { authorizedAPI } from "@/orpc"

const commentPostResource = z.object({
  id: z.string(),
  name: z.string(),
})

const listCommentPostsInput = z.object({
  workspaceId: z.string(),
})

const formatPostLabel = (text: string | undefined, createdAt: string) => {
  const label = text?.trim() || "Untitled post"
  return `${label.slice(0, 80)} · ${new Date(createdAt).toLocaleDateString()}`
}

const listCommentPostsAuthenticatedAPI = authorizedAPI
  .route({
    method: "GET",
    path: "/workspaces/{workspaceId}/triggers/comment-posts",
    summary: "List commentable posts",
    tags: ["Triggers"],
  })
  .input(listCommentPostsInput)
  .use(workspaceAuthorizedMidddleware, (input) => input.workspaceId)
  .output(z.object({ data: z.array(commentPostResource) }))
  .handler(async ({ input }) => {
    const [{ data: instagrams }, { data: messengers }] = await Promise.all([
      listIntegrationInstagrams({ workspaceId: input.workspaceId }),
      listIntegrationMessengers({ workspaceId: input.workspaceId }),
    ])

    const instagramTasks = instagrams.map(async (integration) => {
      const ctx = await buildContext({
        workspaceId: integration.workspaceId,
        integrationType: "instagram",
        integration: {
          ...integration,
          auth: integration.auth as InstagramAuthValue,
        },
      })
      const result = await integrations.instagram.runAction("listPosts", {
        ctx,
      })
      return result.data.flatMap((post) =>
        post.id
          ? [
              {
                id: post.id,
                name: `Instagram: ${formatPostLabel(post.caption, post.timestamp)}`,
              },
            ]
          : [],
      )
    })

    const messengerTasks = messengers.map(async (integration) => {
      const ctx = await buildContext({
        workspaceId: integration.workspaceId,
        integrationType: "messenger",
        integration: {
          ...integration,
          auth: integration.auth as MessengerAuthValue,
        },
      })
      const result = await integrations.messenger.runAction("listPosts", {
        ctx,
      })
      return result.data.flatMap((post) =>
        post.id
          ? [
              {
                id: post.id,
                name: `Facebook: ${formatPostLabel(post.message, post.created_time)}`,
              },
            ]
          : [],
      )
    })

    const results = await Promise.allSettled([
      ...instagramTasks,
      ...messengerTasks,
    ])

    return {
      data: results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      ),
    }
  })

export const triggersCommentPostAPIs = {
  listCommentPostsAuthenticatedAPI,
}
