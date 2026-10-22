import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { createBook, removeBook, replaceBook, subscribeBooks, toggleFavorite } from './bookService';

const BooksContext = createContext(null);

// The context holds one account's books at a time; the provider remounts
// on a uid change so the new account always starts from an empty state.
const EMPTY_STATE = {
  books: [],
  sortedBooks: [],
  findBook: () => undefined,
  add: async () => {
    throw new Error('No user is signed in.');
  },
  update: async () => {
    throw new Error('No user is signed in.');
  },
  toggle: async () => {
    throw new Error('No user is signed in.');
  },
  remove: async () => {
    throw new Error('No user is signed in.');
  },
};

function BookScope({ uid, children }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    return subscribeBooks(uid, setBooks);
  }, [uid]);

  // Alphabetical by title (case-insensitive), equal titles by author.
  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const at = String(a.title || '').toLowerCase();
      const bt = String(b.title || '').toLowerCase();
      if (at !== bt) return at.localeCompare(bt);
      const aa = String(a.author || '').toLowerCase();
      const ab = String(b.author || '').toLowerCase();
      return aa.localeCompare(ab);
    });
  }, [books]);

  const findBook = useMemo(() => {
    return (id) => books.find((b) => b.id === id);
  }, [books]);

  const value = useMemo(() => {
    return {
      books,
      sortedBooks,
      findBook,
      add: (values) => createBook({ uid, ...values }),
      update: (oldBook, next) => replaceBook(oldBook, next),
      toggle: (book) => toggleFavorite(book),
      remove: (id) => removeBook(id),
    };
  }, [books, sortedBooks, findBook, uid]);

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function BooksProvider({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <BooksContext.Provider value={EMPTY_STATE}>{children}</BooksContext.Provider>;
  }

  return (
    <BookScope key={user.uid} uid={user.uid}>
      {children}
    </BookScope>
  );
}

export function useBooks() {
  return useContext(BooksContext);
}
