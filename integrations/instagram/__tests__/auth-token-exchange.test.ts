import { afterEach, describe, expect, it, vi } from "vitest"
import { exchangeCodeForToken, exchangeLongLivedToken } from "../src/apis/auth"
import { InstagramAPIException } from "../src/exception"
import {
  instagramBusinessClient,
  instagramOAuthClient,
} from "../src/lib/http-client"

describe("exchangeLongLivedToken", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("falls back to the short-lived token when Meta rejects token exchange", async () => {
    vi.spyOn(instagramOAuthClient, "post").mockResolvedValue({
      access_token: "short-lived-token",
      user_id: "user-1",
    })
    vi.spyOn(instagramBusinessClient, "get").mockRejectedValue(
      new InstagramAPIException("Unsupported request - method type: get"),
    )

    await expect(
      exchangeCodeForToken(
        { clientId: "client", clientSecret: "secret" },
        "code",
        "https://app.test/callback",
      ),
    ).resolves.toEqual({
      accessToken: "short-lived-token",
      userId: "user-1",
    })
  })

  it("gets the short-lived token exchange with query params", async () => {
    const get = vi.spyOn(instagramBusinessClient, "get").mockResolvedValue({
      access_token: "long-lived-token",
      expires_in: 5_184_000,
    })

    await expect(
      exchangeLongLivedToken(
        { clientId: "client", clientSecret: "secret" },
        "short-lived-token",
      ),
    ).resolves.toBe("long-lived-token")

    expect(get).toHaveBeenCalledWith("access_token", {
      searchParams: {
        grant_type: "ig_exchange_token",
        client_secret: "secret",
        access_token: "short-lived-token",
      },
    })
  })
})
