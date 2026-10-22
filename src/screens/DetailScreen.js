import { useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { AppButton, Badge, Banner, Card, SectionTitle, StarButton } from '../components/ui';
import { BookFormFields } from '../components/BookFormFields';
import { validateBook } from '../validation';
import { bookErrorMessage } from '../bookService';
import { useBooks } from '../BooksContext';
import { colors, fontSizes, spacing } from '../theme';

export default function DetailScreen({ bookId, onBack, onReselect }) {
  const { findBook, toggle, remove, update } = useBooks();
  const book = findBook(bookId);

  const [mode, setMode] = useState('view');
  const [editValues, setEditValues] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState(false);

  // Hardware back returns to the List screen.
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  const editErrors = submitted && mode === 'edit' ? validateBook(editValues) : {};

  const startEdit = () => {
    setEditValues({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      status: book.status || '',
      rating: book.rating === null || book.rating === undefined ? '' : String(book.rating),
      notes: book.notes || '',
    });
    setSubmitted(false);
    setEditError('');
    setMode('edit');
  };

  const cancelEdit = () => {
    setSubmitted(false);
    setEditError('');
    setMode('view');
  };

  const updateField = (field, value) => setEditValues((prev) => ({ ...prev, [field]: value }));

  const saveEdit = async () => {
    setSubmitted(true);
    setEditError('');
    if (Object.keys(validateBook(editValues)).length > 0) return;
    setBusy(true);
    try {
      const updated = await update(book, editValues);
      setSubmitted(false);
      setMode('view');
      if (onReselect && updated && updated.id !== bookId) onReselect(updated.id);
    } catch (error) {
      setEditError(bookErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete book',
      `"${book.title}" will be removed from your shelf permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(book.id);
            onBack();
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!book) {
    return (
      <View style={styles.screen}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Opening the book…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <AppButton label="← Back" variant="ghost" small style={styles.backBtn} onPress={onBack} testID="detail-back" />
        <Text style={styles.headerTitle}>Detail</Text>
        <StarButton active={Boolean(book.favorite)} onToggle={() => toggle(book)} />
      </View>

      {mode === 'view' ? (
        <View style={styles.content}>
          <Card testID="detail-view">
            <Text style={styles.detailTitle} testID="detail-title">
              {book.title}
            </Text>
            <Text style={styles.detailAuthor} testID="detail-author">
              {book.author}
            </Text>

            <View style={styles.badgeRow}>
              <Badge text={book.genre} />
              <Badge text={book.status} />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue} testID="detail-rating">
                {book.rating === null || book.rating === undefined ? 'Not rated' : `${book.rating} / 5`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={[styles.detailValue, styles.notesValue]} testID="detail-notes">
                {book.notes ? book.notes : 'No notes'}
              </Text>
            </View>

            {editError ? <Banner type="error" text={editError} testID="error-edit" /> : null}

            <View style={styles.actionRow}>
              <AppButton label="Edit" onPress={startEdit} testID="edit-book" style={styles.actionBtn} />
              <AppButton label="Delete" variant="danger" onPress={confirmDelete} testID="delete-book" style={styles.actionBtn} />
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.content}>
          <Card testID="detail-edit">
            <SectionTitle style={styles.blockTitle}>Edit book</SectionTitle>
            <BookFormFields values={editValues} errors={editErrors} onChange={updateField} />
            {editError ? <Banner type="error" text={editError} testID="error-edit" /> : null}
            <View style={styles.actionRow}>
              <AppButton label="Save" onPress={saveEdit} disabled={busy} testID="save-book" style={styles.actionBtn} />
              <AppButton label="Cancel" variant="ghost" onPress={cancelEdit} testID="cancel-edit" style={styles.actionBtn} />
            </View>
          </Card>
        </View>
      )}
    </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerPlaceholder: {
    backgroundColor: colors.card,
    height: 76,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  blockTitle: {
    marginBottom: spacing.md,
  },
  detailTitle: {
    fontSize: fontSizes.big,
    fontWeight: '800',
    color: colors.text,
  },
  detailAuthor: {
    fontSize: fontSizes.body,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  detailLabel: {
    width: 70,
    fontSize: fontSizes.body,
    color: colors.muted,
  },
  detailValue: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
    fontWeight: '600',
  },
  notesValue: {
    fontWeight: '400',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});
