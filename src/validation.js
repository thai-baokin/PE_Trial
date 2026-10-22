export const MSG = {
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email address',
  passwordRequired: 'Password is required',
  passwordShort: 'Password must be at least 6 characters',
  confirmRequired: 'Confirm password is required',
  passwordsDoNotMatch: 'Passwords do not match',
  titleRequired: 'Title is required',
  titleTooLong: 'Title must be at most 100 characters',
  authorRequired: 'Author is required',
  authorTooLong: 'Author must be at most 60 characters',
  genreRequired: 'Please choose a genre',
  statusRequired: 'Please choose a status',
  ratingInvalid: 'Rating must be a whole number from 0 to 5',
  notesTooLong: 'Notes must be at most 300 characters',
  bookSuccess: 'Book added',
  registerSuccess: 'Registration successful',
  emptyList: 'No books found',
  duplicateBook: 'A book with the same title and author already exists.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || '').trim());
}

function checkEmail(value, errors) {
  if (!String(value || '').trim()) {
    errors.email = MSG.emailRequired;
  } else if (!isValidEmail(value)) {
    errors.email = MSG.emailInvalid;
  }
}

export function validateRegister({ email, password, confirm } = {}) {
  const errors = {};
  checkEmail(email, errors);
  if (!String(password || '')) {
    errors.password = MSG.passwordRequired;
  } else if (String(password).length < 6) {
    errors.password = MSG.passwordShort;
  }
  if (!String(confirm || '')) {
    errors.confirm = MSG.confirmRequired;
  } else if (String(confirm) !== String(password)) {
    errors.confirm = MSG.passwordsDoNotMatch;
  }
  return errors;
}

export function validateLogin({ email, password } = {}) {
  const errors = {};
  checkEmail(email, errors);
  if (!String(password || '')) {
    errors.password = MSG.passwordRequired;
  }
  return errors;
}

export function validateBook({ title, author, genre, status, rating, notes } = {}) {
  const errors = {};
  const rawTitle = String(title ?? '');
  const trimmedTitle = rawTitle.trim();
  if (!trimmedTitle) {
    errors.title = MSG.titleRequired;
  } else if (rawTitle.length > 100) {
    errors.title = MSG.titleTooLong;
  }

  const rawAuthor = String(author ?? '');
  const trimmedAuthor = rawAuthor.trim();
  if (!trimmedAuthor) {
    errors.author = MSG.authorRequired;
  } else if (rawAuthor.length > 60) {
    errors.author = MSG.authorTooLong;
  }

  if (!genre) {
    errors.genre = MSG.genreRequired;
  }
  if (!status) {
    errors.status = MSG.statusRequired;
  }

  const ratingText = String(rating ?? '').trim();
  if (ratingText) {
    if (!/^\d+$/.test(ratingText)) {
      errors.rating = MSG.ratingInvalid;
    } else {
      const n = parseInt(ratingText, 10);
      if (n < 0 || n > 5) {
        errors.rating = MSG.ratingInvalid;
      }
    }
  }

  const notesText = String(notes ?? '');
  if (notesText.length > 300) {
    errors.notes = MSG.notesTooLong;
  }

  return errors;
}

// Normalized duplicate key: lowercase + trimmed, title then author.
export function normKey(title, author) {
  return `${String(title ?? '').trim().toLowerCase()}|${String(author ?? '').trim().toLowerCase()}`;
}
