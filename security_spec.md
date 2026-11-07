# Security Specification & Test Payloads

## 1. Data Invariants
1. **Strict User Isolation**: A task cannot be created, read, updated, or deleted unless `request.auth.uid == resource.data.userId` (or `incoming().userId` for create).
2. **Path Variable Hardening**: Document IDs ({taskId}, {userId}) must satisfy `isValidId(id)` (alphanumeric and dashes/underscores, <= 128 characters).
3. **No Blanket Reads**: Client list queries MUST evaluate `resource.data.userId == request.auth.uid`. No unauthenticated or cross-user list queries are permitted.
4. **Field Immutability**: `userId` and `createdAt` cannot be altered after creation.
5. **Anti-Update-Gap Key Enforcement**: Create enforces required keys and allowed keys (`hasAll` and `hasOnly`). Update operations are constrained to valid allowed keys using `affectedKeys().hasOnly(...)`.
6. **Temporal Server Timestamp Verification**: `createdAt` must match `request.time` on creation; `updatedAt` must match `request.time` on updates.
7. **String & Array Boundaries**: `title` must be a string with size between 1 and 256; `description` <= 2000; `category` <= 64; `priority` in `['low', 'medium', 'high', 'urgent']`.

## 2. The Dirty Dozen Payloads (12 Attack & Failure Payloads)

1. **Payload 1 (Identity Spoofing - Impersonation)**:
   Attempting to create a task with another user's `userId` (`"victim-uid"` while authenticated as `"attacker-uid"`).
   *Expected: PERMISSION_DENIED*

2. **Payload 2 (Unauthenticated List Query)**:
   Querying `/tasks` without authentication (`request.auth == null`).
   *Expected: PERMISSION_DENIED*

3. **Payload 3 (Cross-User List Query)**:
   Authenticated user `"userA"` querying tasks where `userId == "userB"`.
   *Expected: PERMISSION_DENIED*

4. **Payload 4 (Cross-User Direct Document Read / Get)**:
   Authenticated user `"userA"` attempting to `get` document `/tasks/task-owned-by-userB`.
   *Expected: PERMISSION_DENIED*

5. **Payload 5 (Shadow Field Injection / Over-posting)**:
   Attempting to create a task with an unmodeled ghost field: `{ "userId": "userA", "title": "Test", "completed": false, "isAdmin": true, "role": "superadmin" }`.
   *Expected: PERMISSION_DENIED*

6. **Payload 6 (Resource Exhaustion / Denial of Wallet - Title Length)**:
   Attempting to create a task with a 50KB title string.
   *Expected: PERMISSION_DENIED*

7. **Payload 7 (Path Variable ID Poisoning)**:
   Writing to `/tasks/` with an ID containing malicious symbols, traversal or massive 2KB string `../../../etc/passwd`.
   *Expected: PERMISSION_DENIED*

8. **Payload 8 (Ownership Hijacking via Update)**:
   Attempting to update `userId` on existing task to reassign it to another user or change immutable owner.
   *Expected: PERMISSION_DENIED*

9. **Payload 9 (Creation Timestamp Forgery)**:
   Sending client-crafted past or future timestamp string for `createdAt` instead of `request.time`.
   *Expected: PERMISSION_DENIED*

10. **Payload 10 (Invalid Priority Enum Value)**:
    Attempting to set priority to `"critical_bypass"` instead of valid enums (`low`, `medium`, `high`, `urgent`).
    *Expected: PERMISSION_DENIED*

11. **Payload 11 (Cross-User Delete)**:
    Authenticated user `"userA"` attempting to delete `/tasks/task-owned-by-userB`.
    *Expected: PERMISSION_DENIED*

12. **Payload 12 (Profile Spoofing / Self-Elevated Privilege)**:
    Attempting to create or update `/users/{userId}` where `userId != request.auth.uid` or injecting admin privileges.
    *Expected: PERMISSION_DENIED*
