import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, AppLink, Banner, Card, Field } from '../components/ui';
import { validateRegister, MSG } from '../validation';
import { register } from '../authService';
import { useAuth } from '../AuthContext';
import { colors, fontSizes, spacing } from '../theme';

export default function RegisterScreen({ onBack, onFinish, registered }) {
  const { setHoldNav } = useAuth();
  const [values, setValues] = useState({ email: '', password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ownSuccess, setOwnSuccess] = useState(false);
  const succeeded = ownSuccess || Boolean(registered);

  const errors = submitted && !succeeded ? validateRegister(values) : {};

  const update = (field, text) => setValues((prev) => ({ ...prev, [field]: text }));

  const submit = async () => {
    setSubmitted(true);
    setAuthError('');
    if (Object.keys(validateRegister(values)).length > 0) return;
    setBusy(true);
    setHoldNav(true);
    try {
      await register(values.email, values.password);
      setOwnSuccess(true);
    } catch (error) {
      setHoldNav(false);
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <AppButton label="← Back" variant="ghost" small style={styles.backBtn} onPress={onBack} testID="back-button" />
        <Text style={styles.headerTitle}>Register</Text>
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
                placeholder="At least 6 characters"
              />
            </Field>

            <Field label="Confirm password" error={errors.confirm}>
              <AppInput
                testID="input-confirm"
                value={values.confirm}
                onChangeText={(text) => update('confirm', text)}
                placeholder="Repeat your password"
              />
            </Field>

            {authError ? <Banner type="error" text={authError} testID="error-auth" /> : null}

            {succeeded ? (
              <>
                <Banner type="success" text={MSG.registerSuccess} testID="form-success" />
                <AppButton label="Continue to your books" onPress={onFinish} testID="register-continue" style={styles.submitBtn} />
              </>
            ) : (
              <AppButton label="Register" onPress={submit} disabled={busy} testID="register-submit" style={styles.submitBtn} />
            )}
          </Card>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <AppLink label="Login" onPress={onBack} />
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
