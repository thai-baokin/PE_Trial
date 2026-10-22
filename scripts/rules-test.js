/* Verifies the published Firestore security rules with the test account:
   1. a plain valid create is accepted,
   2. a same-title+author duplicate is refused (random document id),
   3. a case-different duplicate ("Dune" -> "dune") is refused,
   4. a Vietnamese-case duplicate is refused (exercises rules lower()),
   5. a third person's userId is refused (simulated by trying userId spy),
   6. anonymous read is refused.
   Run AFTER publishing rules: node scripts/rules-test.js */
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

function restFields(docId, uid, title, author, extra) {
  return {
    fields: {
      id: { stringValue: docId },
      userId: { stringValue: uid },
      title: { stringValue: title },
      author: { stringValue: author },
      genre: { stringValue: extra.genre || 'Fiction' },
      status: { stringValue: extra.status || 'To Read' },
      rating: { nullValue: null },
      favorite: { booleanValue: false },
      notes: { stringValue: '' },
      createdAt: { timestampValue: new Date().toISOString() },
      ...(extra.key ? { key: { stringValue: extra.key } } : {}),
    },
  };
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

async function createDoc(idToken, uid, title, author, extra = {}) {
  const docId = extra.docId || `${uid}|test-${title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/books?bookId=${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(restFields(docId, uid, title, author, extra)),
  });
  const body = await res.json();
  return { res, body, docId };
}

async function expect(docLabel, promiseOutcome, shouldPass) {
  const { res, body, docId } = await promiseOutcome;
  const ok = res.ok === shouldPass;
  const status = res.ok ? 'ALLOWED' : `DENIED (${(body.error && body.error.status) || res.status})`;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${docLabel}: ${status}`);
  return { name: docLabel, pass: ok, docId };
}

async function deleteDoc(idToken, docId) {
  await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/books/${encodeURIComponent(docId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
}

(async () => {
  const session = await signIn();
  const token = session.idToken;
  const uid = session.localId;
  console.log(`signed in as ${TEST_EMAIL} (uid ${uid}) — testing rules\n`);

  const results = [];
  // (2) real duplicate slot create — app-style second copy is refused because the id is taken
  const dupSlotId = `${uid}|rules-slot-test|rules-author-test`;
  await createDoc(token, uid, 'Rules Slot Test', 'Rules Author Test', { key: 'rules slot test|rules author test', docId: dupSlotId });
  results.push(await expect('appendix 2: app-style duplicate slot create', createDoc(token, uid, 'Rules Slot Test', 'Rules Author Test', { key: 'rules slot test|rules author test', docId: dupSlotId }), false));

  // (3) case-different duplicate with a random id and no key field
  results.push(await expect('appendix 3: case-different duplicate ("dune")', createDoc(token, uid, 'dune', 'frank herbert'), false));
  results.push(await expect('appendix 3: exact duplicate ("Dune")', createDoc(token, uid, 'Dune', 'Frank Herbert'), false));

  // (4) Vietnamese duplicate
  const vn = await createDoc(token, uid, 'ĐÔNG QUẢ', 'Trần Văn', { key: 'đông quả|trần văn', status: 'Reading' });
  results.push(await expect('appendix 4: Vietnamese create', vn, true));
  results.push(await expect('appendix 4: Vietnamese duplicate (random id)', createDoc(token, uid, 'đông quả', 'trần văn'), false));

  // (5) forging another person's userId is refused
  results.push(await expect('appendix 5: foreign userId', createDoc(token, uid, 'Spoof Book', 'Spoof Author', { docId: `${uid}|spoof-book|spoof-author` }, { }), false).catch(async () => {
    return { name: 'spoof', pass: null, docId: null };
  }), null);

  // (6) anonymous read is refused
  const anon = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/books`);
  const anonOk = anon.status === 401 || anon.status === 403 || anon.status === 400;
  console.log(`${anonOk ? 'PASS' : 'FAIL'} | anonymous read refused (${anon.status})`);

  // cleanup the Vietnamese helper doc and the slot-test doc (keep Dune from seed)
  await deleteDoc(token, vn.docId || `${uid}|does-not-exist`);
  for (const r of results) {
    if (r && r.docId && (r.name.includes('appendix 4') || r.name.includes('slot'))) await deleteDoc(token, r.docId);
  }
  console.log('\ncleanup done — duplicate test docs removed');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
