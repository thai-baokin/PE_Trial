import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card } from '../components/ui';
import { colors, fontSizes, spacing } from '../theme';

const FEATURES = [
  { title: 'Track your books', text: 'Keep every book you own or want to read in one private list.' },
  { title: 'Sort by status', text: 'Organise your shelf with To Read, Reading and Finished.' },
  { title: 'Rate your favorites', text: 'Star the best ones and grade them from 0 to 5.' },
];

export default function HomeScreen({ onLogin, onRegister }) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BookShelf</Text>
        <View style={styles.headerButtons}>
          <AppButton label="Login" variant="ghost" testID="login-button" onPress={onLogin} small style={styles.headerBtn} />
          <AppButton label="Register" testID="register-button" onPress={onRegister} small style={styles.headerBtn} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.homeTitle} testID="home-title">
          BookShelf
        </Text>
        <Text style={styles.description}>
          Your own private list of books you own or want to read — sorted by reading status and genre, with a favorite flag.
        </Text>

        {FEATURES.map((feature, index) => (
          <Card key={feature.title} testID={`feature-card-${index + 1}`} style={styles.featureCard}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureText}>{feature.text}</Text>
          </Card>
        ))}
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '700',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerBtn: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  homeTitle: {
    fontSize: fontSizes.huge,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  featureCard: {
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: fontSizes.small,
    color: colors.muted,
    lineHeight: 20,
  },
});
