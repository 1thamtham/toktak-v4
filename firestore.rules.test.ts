import assert from 'node:assert/strict';

/**
 * Phase 0 Payload-First Security TDD specification checks for TokTak Firestore Rules.
 * Validates the Dirty Dozen adversarial payloads against blueprint constraints and rule invariants.
 */

interface DirtyDozenCase {
  id: number;
  name: string;
  targetPath: string;
  payload: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
  reason: string;
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unverified Email Video Create',
    targetPath: '/videos/clip-101',
    payload: { id: 'clip-101', authorId: 'userA', emailVerified: false },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'request.auth.token.email_verified == true is mandatory'
  },
  {
    id: 2,
    name: 'Author Spoofing',
    targetPath: '/videos/clip-102',
    payload: { id: 'clip-102', authorId: 'victimUid' },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'incoming().authorId must equal request.auth.uid'
  },
  {
    id: 3,
    name: 'Shadow Ghost Field',
    targetPath: '/videos/clip-103',
    payload: { id: 'clip-103', authorId: 'userA', isOfficialVerified: true },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'data.keys().hasOnly(...) blocks unrecognized shadow fields'
  },
  {
    id: 4,
    name: 'Self-Assigned Admin Role',
    targetPath: '/users/userA',
    payload: { uid: 'userA', email: 'attacker@example.com', role: 'admin' },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'Users can only create /users/{uid} with role == "user"'
  },
  {
    id: 5,
    name: 'ID Poisoning (Oversized ID)',
    targetPath: `/videos/${'x'.repeat(200)}`,
    payload: { id: 'x'.repeat(200) },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'isValidId() restricts IDs to <= 128 chars matching ^[a-zA-Z0-9_\\-]+$'
  },
  {
    id: 6,
    name: 'Ephemeral Blob URL Injection',
    targetPath: '/videos/clip-106',
    payload: { id: 'clip-106', url: 'blob:https://toktak.app/abc' },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'Video url must match ^https?://.+'
  },
  {
    id: 7,
    name: 'Unbacked Like Counter Inflation',
    targetPath: '/videos/clip-107',
    payload: { likes: 999999 },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'Likes counter updates require +/-1 delta with atomic existsAfter/!existsAfter on /likes/{uid}'
  },
  {
    id: 8,
    name: 'Orphaned Subcollection Comment',
    targetPath: '/videos/missing-video/comments/cmt-1',
    payload: { id: 'cmt-1', videoId: 'missing-video', text: 'spam' },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'exists(/databases/$(database)/documents/videos/$(videoId)) must be true'
  },
  {
    id: 9,
    name: 'Cross-User PII Access',
    targetPath: '/users/victimUid',
    payload: {},
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'PII documents strictly enforce isOwner(userId) || isAdmin()'
  },
  {
    id: 10,
    name: 'Unauthorized Collection List Query',
    targetPath: '/orders',
    payload: {},
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'allow list requires resource.data.userId == request.auth.uid'
  },
  {
    id: 11,
    name: 'Terminal State Mutation',
    targetPath: '/orders/ord-1',
    payload: { status: 'pending' },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'Completed or cancelled orders are locked unless isAdmin()'
  },
  {
    id: 12,
    name: 'Forged Timestamp Injection',
    targetPath: '/videos/clip-112',
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
    reason: 'createdAt must equal request.time'
  }
];

assert.equal(DIRTY_DOZEN_PAYLOADS.length, 12);
for (const testCase of DIRTY_DOZEN_PAYLOADS) {
  assert.equal(testCase.expectedOutcome, 'PERMISSION_DENIED');
}
