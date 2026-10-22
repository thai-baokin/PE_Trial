/* Seeds the grader test account and three sample books through the
   Firebase REST APIs — no service account involved: the books are written
   with the test account's own ID token, exactly like the app does it. */
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadEnvFile();

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'pe123-df353';
const TEST_EMAIL = process.env.SEED_EMAIL || 'grader.qe190108@example.com';
const TEST_PASSWORD = process.env.SEED_PASSWORD || 'Test1234!';

function normKey(title, author) {
  return `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;
}

async function createAuthUser() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
  });
  const body = await res.json();
  if (res.ok) return body;
  if (body.error && body.error.message === 'EMAIL_EXISTS') return null;
  throw new Error(`Auth signup failed: ${JSON.stringify(body)}`);
}

async function signIn() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Sign in failed: ${JSON.stringify(body)}`);
  return body;
}

async function upsertBook(idToken, uid, book) {
  const key = normKey(book.title, book.author);
  const docId = `${uid}|${key}`;
  const fields = {
    id: { stringValue: docId },
    userId: { stringValue: uid },
    title: { stringValue: book.title },
    author: { stringValue: book.author },
    genre: { stringValue: book.genre },
    status: { stringValue: book.status },
    rating: book.rating === null ? { nullValue: null } : { integerValue: String(book.rating) },
    favorite: { booleanValue: Boolean(book.favorite) },
    notes: { stringValue: book.notes || '' },
    key: { stringValue: key },
    createdAt: { timestampValue: new Date().toISOString() },
  };
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/books?bookId=${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fields }),
  });
  const body = await res.json();
  if (res.ok) {
    console.log(`created: ${book.title} — ${book.author}`);
    return true;
  }
  if (body.error && body.error.status === 'ALREADY_EXISTS') {
    console.log(`exists : ${book.title} — ${book.author}`);
    return false;
  }
  console.log(`ERROR  : ${book.title} — ${JSON.stringify(body)}`);
  return false;
}

(async () => {
  if (!API_KEY) throw new Error('EXPO_PUBLIC_FIREBASE_API_KEY missing — create .env first');
  const signup = await createAuthUser();
  if (signup) console.log(`test account created (${signup.localId})`);
  else console.log('test account already exists');

  const session = await signIn();
  const uid = session.localId;
  console.log(`signed in as ${TEST_EMAIL} (uid ${uid})`);

  const books = [
    { title: 'Clean Code', author: 'Robert C. Martin', genre: 'Non-Fiction', status: 'Finished', rating: 5, favorite: true, notes: 'A classic about writing maintainable code.' },
    { title: 'Atomic Habits', author: 'James Clear', genre: 'Non-Fiction', status: 'Reading', rating: 4, favorite: false, notes: 'Small habits, big results.' },
    { title: 'Dune', author: 'Frank Herbert', genre: 'Fiction', status: 'To Read', rating: null, favorite: false, notes: '' },
  ];
  for (const book of books) {
    await upsertBook(session.idToken, uid, book);
  }
  console.log('seed done');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
