import { describe, expect, it } from "vitest"
import { InstagramAPIException } from "../src/exception"
import { isRevokedTokenError } from "../src/lib/error-mapper"

describe("isRevokedTokenError", () => {
  it("detects invalidated sessions even when Meta omits the subcode", () => {
    const error = new InstagramAPIException(
      "Error validating access token: The session has been invalidated because the user changed their password or Facebook has changed the session for security reasons.",
      400,
      190,
    )

    expect(isRevokedTokenError(error)).toBe(true)
  })

  it("detects invalidated sessions when Meta serializes the code", () => {
    const error = new InstagramAPIException(
      "Error validating access token: The session has been invalidated because the user changed their password or Facebook has changed the session for security reasons.",
      400,
      "190",
    )

    expect(isRevokedTokenError(error)).toBe(true)
  })

  it("detects expired sessions even when Meta omits the subcode", () => {
    const error = new InstagramAPIException(
      "Error validating access token: Session has expired on Saturday, 01-Jan-22 00:00:00 PST.",
      400,
      190,
    )

    expect(isRevokedTokenError(error)).toBe(true)
  })
})
