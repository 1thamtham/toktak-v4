# TokTak v4 Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity Integrity**: Every user-owned document (`profiles`, `users`, `videos`, `comments`, `likes`, `savedVideos`, `cartItems`, `orders`, `serviceBookings`) MUST match `request.auth.uid` on creation and preserve ownership immutably on update.
2. **PII Isolation**: Private user emails and roles live exclusively in `/users/{userId}` and `/admins/{adminId}`, strictly readable only by the owner or verified admin (`goldenrivercity@gmail.com` with `email_verified == true` or `/admins/$(uid)`). Public `/profiles/{userId}` and `/videos/{videoId}` never store emails or private contact fields.
3. **Media URL Safety**: Cloud `/videos/{videoId}` documents MUST contain `https://` or `http://` media URLs (never ephemeral `blob:` or `idb://` strings) and enforce bounded sizes to prevent Denial-of-Wallet attacks.
4. **Atomic Like & Comment Counters**: Incrementing/decrementing `likes` or `commentsCount` on `/videos/{videoId}` MUST happen inside an atomic batch synchronized with `/videos/{videoId}/likes/{userId}` (`existsAfter` / `getAfter`) or `/videos/{videoId}/comments/{commentId}`.
5. **Terminal State Locking**: `orders` (`completed`, `cancelled`) and `serviceBookings` (`completed`, `cancelled`) are locked against non-admin mutations once they reach a terminal state.
6. **Strict Server Timestamps**: `createdAt` on create and `updatedAt` on create/update MUST equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Email Upload**: `email_verified: false` creating `/videos/v1` -> `PERMISSION_DENIED`.
2. **Author Spoofing**: User A creating `/videos/v1` with `authorId: "userB"` -> `PERMISSION_DENIED`.
3. **Shadow Ghost Field**: Creating `/videos/v1` with extra `isVerifiedCreator: true` -> `PERMISSION_DENIED`.
4. **Self-Assigned Admin Role**: Creating `/users/userA` with `role: "admin"` -> `PERMISSION_DENIED`.
5. **1.5KB Junk Document ID**: Creating `/videos/${'a'.repeat(300)}` -> `PERMISSION_DENIED`.
6. **Ephemeral Blob URL Injection**: Creating `/videos/v1` with `url: "blob:https://example.com/123"` -> `PERMISSION_DENIED`.
7. **Likes Tampering Without Batch Like Doc**: Updating `/videos/v1` `{ likes: 999999 }` alone -> `PERMISSION_DENIED`.
8. **Orphaned Comment Write**: Creating `/videos/nonexistent/comments/c1` -> `PERMISSION_DENIED`.
9. **Cross-User PII Read**: User B attempting `get /users/userA` -> `PERMISSION_DENIED`.
10. **Blanket List Query Bypass**: User B listing `/orders` without `userId == userB` -> `PERMISSION_DENIED`.
11. **Terminal Order Mutation**: Non-admin updating `/orders/o1` after `status == "completed"` -> `PERMISSION_DENIED`.
12. **Client-Forged Timestamp**: Creating `/videos/v1` with backdated `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
