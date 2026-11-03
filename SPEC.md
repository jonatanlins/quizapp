# QuizApp specification

## Purpose

QuizApp is an AI development quiz platform where users choose a category, answer five multiple-choice questions, learn from feedback, and track their progress.

## Architecture

- **Client:** Next.js, TypeScript, Tailwind CSS, Zustand for client state, and Zod for validation. Persist the username, active session reference, preferences, and attempt history in LocalStorage so they survive reloads.
- **Simulated backend:** Next.js API routes in TypeScript, with Zod-validated requests and responses. The server owns the question bank, answer keys, session state, scoring, idempotency records, and leaderboard totals. Never send answer keys or correctness-revealing explanations before an answer is submitted.
- The simulated server may use an in-memory store for demonstration. Browser reloads resume while that server state exists; server restarts, multiple instances, and cleared storage can lose or fragment data. Durable, shared server storage and authenticated identities are required for reliable cross-device history, leaderboard integrity, and stronger anti-cheating guarantees.

## Quiz flow

1. **Browse and start:** Show a clear landing view explaining the app, a username input, quiz categories, and a start action. The initial bank has three categories with ten questions each.
2. **Start a session:** Choose a category and optional Learn Mode. The server selects exactly five distinct questions in randomized order and returns a session identifier and only the first question. A retake creates a new session with a newly randomized selection and order.
3. **Answer:** Display one multiple-choice question at a time and a progress indicator (question 1–5). The client submits the selected option to the server; the server validates it and returns correct/incorrect feedback and an explanation. Show feedback before allowing the next question.
4. **Learn Mode:** Show an educational hint or background explanation before answering without revealing the correct option. Show the full answer explanation after submission.
5. **Results:** After question five, show correct answers out of five, percentage, a score-dependent performance message, and a review of missed questions with correct answers and explanations. Offer a retake.

## Session state and reliability

- Model each session as a state machine: `question_ready → submitting → feedback → question_ready` for questions 1–4, and `question_ready → submitting → feedback → completed` for question 5. After an uncertain submission, reconcile with the server or retry the same idempotent request before accepting a different answer. The server enforces transitions and rejects answers to previously answered or out-of-order questions; the client cannot navigate back to answer them again.
- Assign one idempotency key per question submission and reuse it for retries. The server atomically records the key and result: duplicates with the same payload return the original result without scoring twice; reuse with a different payload is rejected. Disable answer controls while submitting as an additional safeguard.
- Restore an active session after reload by reconciling its LocalStorage reference with authoritative server state. If the server session is unavailable, explain the loss and offer a fresh start; never silently invent a result. Persist completed attempts locally without duplicating them on reload or retry.
- Provide clear empty, loading, and error states for category browsing, quiz sessions, history, and leaderboard. Errors offer contextual retry or recovery actions.
- Include a visible **chaos bar** for simulated failures, such as request latency and failed start, answer, or result requests. Failures must exercise loading, error, retry, and idempotency behavior without corrupting session or score state.

## Progress and leaderboard

- Record each completed attempt with category, date, score, percentage, and missed-question review. Show attempt history and a simple chronological view of progress over time; preserve both across browser sessions using LocalStorage.
- Display a leaderboard ranked by each username's **total correct answers across completed quiz sessions**, not the best single-session score. Count a completed session once, including retakes. The simulated backend is authoritative for leaderboard totals; local history supports the current browser's progress view.
- Treat usernames as display identifiers for the simulated experience, not verified identities; explain that shared or changed names and server resets can affect leaderboard accuracy.

## Edge cases and architectural decisions

- The demo uses one long-lived server process with an in-memory store. Restarts and separate instances lose or fragment authoritative data; durable shared storage is required for stronger persistence. Reconcile LocalStorage against the server and report expired sessions.
- Persist an answer's idempotency key before submission. Retry the same payload and key after an uncertain response; reconcile before submitting a different answer. Atomically accept at most one answer per question, including across tabs. Idempotently start sessions and advance only from the expected state.
- Complete and score a session once. Record completion and its leaderboard contribution together; retrieving results and retrying requests must not count it twice.
- LocalStorage and anonymous identifiers are untrusted. Use an opaque session credential outside URLs; a stable anonymous user ID separates identity from display name but is not authentication. Cross-device identity and competitive integrity require accounts and durable storage.
- Rank by cumulative correct answers as requested; expose attempts and accuracy for context and separate standard and Learn Mode totals. Unlimited retakes reward volume, so the leaderboard measures participation as well as knowledge.
- Use a separate non-revealing learning note before each answer. Explanations and a small bank make memorization possible; use larger banks and randomized questions and options. Select without replacement within a session.
- Snapshot question content for active sessions and completed reviews so bank edits do not change existing attempts. Report unavailable or corrupt browser storage and let users clear local history.
- Simulate both failure before processing and response loss after processing; restrict chaos controls to development or demo environments. A lost response is an uncertain outcome, not proof that an answer failed.
- The server state machine consists of awaiting answer, feedback, and completed. Submitting is a client-side state; after a network failure reconcile with the server before allowing a different answer.

## Daily challenge

- Each UTC calendar day has a shared five-question challenge drawn from all categories, deterministically selected and ordered by the server using the date and stable question IDs. The question bank must remain unchanged for the same date to reproduce a challenge.
- Start and answer through the existing session state machine and idempotent APIs. The server pins the date and selected questions at session creation, so a quiz started before midnight can be finished afterward. Retaking starts that day's challenge again; repeated completed attempts count in the existing cumulative leaderboard.
- Mark daily sessions and history with their challenge date. Keep one-question-at-a-time delivery and randomized answer options, and provide a distinct colorful challenge presentation. Learn Mode remains available.
