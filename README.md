# Secret Santa — mobile-friendly app scaffold

This is a Firebase-backed scaffold for an online Secret Santa game. It includes a responsive web app and callable Cloud Functions for room creation, joining, drawing, and private reveal.

## What works in the prototype
- Create rooms with a name and gift budget
- Join by room code
- Organizer starts a draw
- Secret assignments are stored server-side and only revealed to the matching participant

## Setup (Firebase)
1. Install Node.js and Firebase CLI.
2. Create a Firebase project and enable Authentication (Anonymous) and Firestore.
3. In `functions/`, run `npm install`.
4. In project root, run `npm install`.
5. Create `.env` in project root with `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` from Firebase Web App config.
6. Run `firebase init` and select Firestore + Functions; choose JavaScript for Functions and Node 20.
7. Deploy functions: `firebase deploy --only functions`.
8. Run web app: `npm run dev`.

## Security note
The Cloud Functions use authenticated anonymous Firebase users and perform room operations. Firestore client reads are deliberately blocked by rules; clients should only use callable functions. This is a scaffold; before a public launch, review rules, rate limiting, room-code entropy, abuse controls, and privacy notices.

## Build
`npm run build`
