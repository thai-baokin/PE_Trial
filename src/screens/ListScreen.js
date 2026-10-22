import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, Badge, Banner, Card, ChipRow, SectionTitle, StarButton, SwitchRow } from '../components/ui';
import { BookFormFields } from '../components/BookFormFields';
import { GENRES, STATUSES } from '../constants';
import { MSG, validateBook } from '../validation';
import { logout } from '../authService';
import { bookErrorMessage } from '../bookService';
import { useAuth } from '../AuthContext';
import { useBooks } from '../BooksContext';
import { colors, fontSizes, spacing } from '../theme';

const EMPTY_ADD = { title: '', author: '', genre: '', status: '', rating: '', notes: '' };

export default function ListScreen({ onOpenBook, onLogout }) {
  const { user } = useAuth();
  const { sortedBooks, add, toggle } = useBooks();

  // ----- filters -----
  const [genre, setGenre] = useState('All');
  const [status, setStatus] = useState('All');
  const [favOnly, setFavOnly] = useState(false);
  const [search, setSearch] = useState('');

  const clearFilters = () => {
    setGenre('All');
    setStatus('All');
    setFavOnly(false);
    setSearch('');
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedBooks.filter((book) => {
      if (genre !== 'All' && book.genre !== genre) return false;
      if (status !== 'All' && book.status !== status) return false;
      if (favOnly && !book.favorite) return false;
      if (q) {
        const title = String(book.title || '').toLowerCase();
        const author = String(book.author || '').toLowerCase();
        if (!title.includes(q) && !author.includes(q)) return false;
      }
      return true;
    });
  }, [sortedBooks, genre, status, favOnly, search]);

  // ----- summary over the books currently shown -----
  const summary = useMemo(() => {
    let favorites = 0;
    const statusCounts = {};
    visible.forEach((book) => {
      if (book.favorite) favorites += 1;
      if (book.status) statusCounts[book.status] = (statusCounts[book.status] || 0) + 1;
    });
    const rows = STATUSES.filter((s) => statusCounts[s] > 0)
      .map((s) => ({ status: s, count: statusCounts[s] }))
      // most books first; equal counts keep To Read → Reading → Finished
      .sort((a, b) => b.count - a.count || STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));
    return { total: visible.length, favorites, rows };
  }, [visible]);

  // ----- add book form -----
  const [form, setForm] = useState(EMPTY_ADD);
  const [submitted, setSubmitted] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [backendError, setBackendError] = useState('');
  const formErrors = submitted ? validateBook(form) : {};

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const submitAdd = async () => {
    setSubmitted(true);
    setBookSuccess(false);
    setBackendError('');
    if (Object.keys(validateBook(form)).length > 0) return;
    try {
      await add(form);
      setBookSuccess(true);
      setForm(EMPTY_ADD);
      setSubmitted(false);
    } catch (error) {
      setBackendError(bookErrorMessage(error));
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerApp}>BookShelf</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userEmail} testID="user-email">
            {user.email}
          </Text>
        </View>
        <AppButton label="Logout" variant="ghost" small testID="logout-button" onPress={handleLogout} style={styles.logoutBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="list-screen">
        {/* Add a book */}
        <Card>
          <SectionTitle style={styles.blockTitle}>Add a book</SectionTitle>
          <View testID="book-form">
            <BookFormFields values={form} errors={formErrors} onChange={updateForm} />
            {bookSuccess ? <Banner type="success" text={MSG.bookSuccess} testID="book-success" /> : null}
            {backendError ? <Banner type="error" text={backendError} testID="error-book" /> : null}
            <AppButton label="Add book" onPress={submitAdd} testID="add-book-button" style={styles.blockBtn} />
          </View>
        </Card>

        {/* Filters and search */}
        <Card>
          <SectionTitle style={styles.blockTitle}>Filter and search</SectionTitle>
          <ChipRow
            label="Genre"
            options={['All', ...GENRES]}
            value={genre}
            onChange={setGenre}
            testIdPrefix="filter-genre"
          />
          <ChipRow
            label="Status"
            options={['All', ...STATUSES]}
            value={status}
            onChange={setStatus}
            testIdPrefix="filter-status"
          />
          <SwitchRow
            label="Favorites only"
            value={favOnly}
            onValueChange={setFavOnly}
            testID="filter-favorites"
          />
          <View style={styles.fieldWrap}>
            <Text style={styles.textLabel}>Search</Text>
            <AppInput
              testID="search-input"
              value={search}
              onChangeText={setSearch}
              placeholder="Title or author"
            />
          </View>
          <AppButton label="Clear" variant="ghost" small onPress={clearFilters} testID="clear-filters" style={styles.clearBtn} />
        </Card>

        {/* Summary */}
        <Card>
          <SectionTitle style={styles.blockTitle}>Summary</SectionTitle>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Books</Text>
            <Text style={styles.summaryValue} testID="book-count">
              {summary.total}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Favorites</Text>
            <Text style={styles.summaryValue} testID="favorite-count">
              {summary.favorites}
            </Text>
          </View>
          <View style={styles.breakdown}>
            {summary.rows.map((row) => (
              <View key={row.status} style={styles.summaryRow} testID={`status-row-${row.status}`}>
                <Text style={styles.summaryLabel}>{row.status}</Text>
                <Text style={styles.summaryValue}>{row.count}</Text>
              </View>
            ))}
            {summary.rows.length === 0 ? <Text style={styles.noStatus}>No statuses to show yet.</Text> : null}
          </View>
        </Card>

        {/* The list */}
        <SectionTitle style={styles.blockTitle}>Your books</SectionTitle>
        {visible.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText} testID="books-empty">
              No books found
            </Text>
          </Card>
        ) : (
          visible.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onOpen={() => onOpenBook(book.id)}
              onToggleFavorite={() => toggle(book)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function BookItem({ book, onOpen, onToggleFavorite }) {
  return (
    <Pressable testID="book-item" accessibilityRole="button" onPress={onOpen} style={styles.itemCard}>
      <View style={styles.itemInner}>
        <View style={styles.itemRow}>
          <View style={styles.itemMain}>
            <Text style={styles.itemTitle} testID="book-title">
              {book.title}
            </Text>
            <Text style={styles.itemAuthor} testID="book-author">
              {book.author}
            </Text>
          </View>
          <View style={styles.itemSide}>
            <StarButton active={Boolean(book.favorite)} onToggle={onToggleFavorite} />
            <Text style={styles.itemChevron}>›</Text>
          </View>
        </View>
        <View style={styles.itemBadges}>
          <Badge text={book.genre} />
          <Badge text={book.status} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerApp: {
    fontSize: fontSizes.body,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: fontSizes.xsmall,
    color: colors.muted,
    marginTop: 2,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  blockTitle: {
    marginBottom: spacing.md,
  },
  blockBtn: {
    marginTop: spacing.xs,
  },
  fieldWrap: {
    marginBottom: spacing.md,
  },
  textLabel: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.xs + 2,
  },
  clearBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  summaryValue: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.text,
  },
  breakdown: {
    marginTop: spacing.sm,
  },
  noStatus: {
    color: colors.muted,
    fontSize: fontSizes.small,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.muted,
    fontSize: fontSizes.body,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemInner: {
    // whole card opens the Detail screen
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemTitle: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.text,
  },
  itemAuthor: {
    fontSize: fontSizes.small,
    color: colors.muted,
    marginTop: 2,
  },
  itemSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemChevron: {
    fontSize: fontSizes.medium,
    color: '#9AA3B2',
    marginLeft: spacing.xs,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
