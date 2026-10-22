import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTION } from './constants';
import { normKey } from './validation';

// The document id (and the `key` field) is derived from the owner's uid
// plus the lowercased/trimmed title and author. The security rules refuse
// any new document whose slot is already taken, so the same person cannot
// save the same book twice even with different letter case, while two
// different people can still save the same book.
export function bookIdFor(uid, key) {
  return `${uid}|${key}`;
}

// Realtime subscription ordered client-side by the List screen.
export function subscribeBooks(uid, onChange, onError) {
  const q = query(collection(db, COLLECTION), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      onChange(rows);
    },
    (error) => {
      if (onError) onError(error);
      onChange([]);
    }
  );
}

export async function createBook({ uid, title, author, genre, status, rating, notes, favorite, createdAt, key: existingKey }) {
  const key = existingKey || normKey(title, author);
  const id = bookIdFor(uid, key);
  const payload = {
    id,
    userId: uid,
    title: String(title ?? '').trim(),
    author: String(author ?? '').trim(),
    genre,
    status,
    rating: rating === '' || rating === null || rating === undefined ? null : Number(rating),
    favorite: Boolean(favorite),
    notes: String(notes ?? ''),
    key,
    createdAt: createdAt || serverTimestamp(),
  };
  await setDoc(doc(db, COLLECTION, id), payload);
  return payload;
}

export async function toggleFavorite(book) {
  await updateDoc(doc(db, COLLECTION, book.id), { favorite: !book.favorite });
}

// The dedupe key lives in the document id, so an edit that changes the
// title or author removes the old row and saves a new one atomically
// enough for the rules to guard the new slot.
export async function replaceBook(oldBook, next) {
  const sameKey = normKey(oldBook.title, oldBook.author) === normKey(next.title, next.author);
  if (sameKey) {
    const key = oldBook.key || normKey(oldBook.title, oldBook.author);
    await updateDoc(doc(db, COLLECTION, oldBook.id), {
      title: String(next.title ?? '').trim(),
      author: String(next.author ?? '').trim(),
      genre: next.genre,
      status: next.status,
      rating: next.rating === '' || next.rating === null || next.rating === undefined ? null : Number(next.rating),
      notes: String(next.notes ?? ''),
      key,
    });
    return { ...oldBook, ...next, rating: next.rating === '' ? null : next.rating, key, id: oldBook.id };
  }

  const created = await createBook({
    uid: oldBook.userId,
    title: next.title,
    author: next.author,
    genre: next.genre,
    status: next.status,
    rating: next.rating,
    notes: next.notes,
    favorite: oldBook.favorite,
    createdAt: oldBook.createdAt || null,
  });
  await deleteDoc(doc(db, COLLECTION, oldBook.id));
  return created;
}

export async function removeBook(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getBook(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (snap.exists()) {
    return { ...snap.data(), id: snap.id };
  }
  return null;
}

// Firestore permission errors on create usually mean the duplicate slot
// was taken (the rules refuse a second copy of the same title + author).
export function bookErrorMessage(error) {
  const code = error && typeof error === 'object' ? error.code : '';
  if (code === 'permission-denied') {
    return 'A book with the same title and author already exists.';
  }
  return (error && error.message) || 'Something went wrong. Please try again.';
}
