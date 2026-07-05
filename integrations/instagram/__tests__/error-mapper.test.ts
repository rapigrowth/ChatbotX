import { ChannelErrorCategory } from "@chatbotx.io/sdk"
import { describe, expect, it } from "vitest"
import { InstagramAPIException } from "../src/exception"
import { mapToChannelError } from "../src/lib/error-mapper"

describe("Instagram error mapper", () => {
  it("treats abusive/disallowed actions as permanent", () => {
    const mapped = mapToChannelError(
      new InstagramAPIException(
        "The action attempted has been deemed abusive or is otherwise disallowed",
      ),
    )

    expect(mapped.category).toBe(ChannelErrorCategory.PERMISSION_DENIED)
    expect(mapped.isRetryable).toBe(false)
  })
})
