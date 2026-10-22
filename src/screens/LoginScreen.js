import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, AppLink, Banner, Card, Field } from '../components/ui';
import { validateLogin } from '../validation';
import { login } from '../authService';
import { colors, fontSizes, spacing } from '../theme';

export default function LoginScreen({ onBack, onRegister }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  // Nothing is shown before the first submit; afterwards the message
  // disappears as soon as the field becomes valid.
  const errors = submitted ? validateLogin(values) : {};

  const update = (field, text) => setValues((prev) => ({ ...prev, [field]: text }));

  const submit = async () => {
    setSubmitted(true);
    setAuthError('');
    if (Object.keys(validateLogin(values)).length > 0) return;
    setBusy(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <AppButton label="← Back" variant="ghost" small style={styles.backBtn} onPress={onBack} testID="back-button" />
        <Text style={styles.headerTitle}>Login</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            <Field label="Email" error={errors.email}>
              <AppInput
                testID="input-email"
                value={values.email}
                onChangeText={(text) => update('email', text)}
                placeholder="you@example.com"
                keyboardType="email-address"
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <AppInput
                testID="input-password"
                value={values.password}
                onChangeText={(text) => update('password', text)}
                placeholder="Your password"
              />
            </Field>

            {authError ? <Banner type="error" text={authError} testID="error-auth" /> : null}

            <AppButton label="Sign in" onPress={submit} disabled={busy} testID="login-submit" style={styles.submitBtn} />
          </Card>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>No account yet? </Text>
            <AppLink label="Register" onPress={onRegister} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  backBtn: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 64,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.muted,
    fontSize: fontSizes.body,
  },
});
