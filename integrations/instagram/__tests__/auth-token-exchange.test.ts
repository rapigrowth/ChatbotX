import { afterEach, describe, expect, it, vi } from "vitest"
import { exchangeLongLivedToken } from "../src/apis/auth"
import { instagramBusinessClient } from "../src/lib/http-client"

describe("exchangeLongLivedToken", () => {
  afterEach(() => {
    vi.restoreAllMocks()
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
