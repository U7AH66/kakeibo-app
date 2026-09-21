# Security Specification for User Ledgers

## 1. Data Invariants
- Each user has their own private ledger stored strictly at `/users/{userId}/ledger/main`.
- Only authenticated users whose `request.auth.uid == userId` can read or write to `/users/{userId}/ledger/main`.
- Unauthenticated users and other authenticated users are strictly forbidden from reading, listing, or modifying any other user's ledger.
- The document `userId` field inside the data must match `request.auth.uid`.

## 2. Dirty Dozen Payloads (Targeting `/users/{userId}/ledger/main`)
1. Read without login (`request.auth == null`) -> PERMISSION_DENIED
2. Write without login (`request.auth == null`) -> PERMISSION_DENIED
3. Read another user's ledger (`request.auth.uid == 'userA'`, accessing `/users/userB/ledger/main`) -> PERMISSION_DENIED
4. Write to another user's ledger (`request.auth.uid == 'userA'`, modifying `/users/userB/ledger/main`) -> PERMISSION_DENIED
5. List root collections (`/users`) -> PERMISSION_DENIED
6. Spoof `userId` field in payload (`request.auth.uid == 'userA'`, `data.userId == 'userB'`) -> PERMISSION_DENIED
7. Path traversal or junk ID injection -> PERMISSION_DENIED
8. Delete another user's ledger -> PERMISSION_DENIED
9. Exceeding payload size limits -> PERMISSION_DENIED
10. Unverified ghost fields -> PERMISSION_DENIED
11. Reading deleted/legacy `ledgers/{ledgerId}` collection -> PERMISSION_DENIED
12. Modifying non-existent paths -> PERMISSION_DENIED
