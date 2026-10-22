import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { colors, fontSizes, radius, spacing } from '../theme';

export function AppButton({ label, onPress, variant = 'primary', testID, disabled, style, small }) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.card;
  const fg = variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function AppLink({ label, onPress, style }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <Text style={[styles.link, style]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style, testID }) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function AppInput({ value, onChangeText, placeholder, multiline, keyboardType, testID, style }) {
  return (
    <TextInput
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA3B2"
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize="none"
      style={[styles.input, multiline && styles.inputMultiline, style]}
    />
  );
}

export function Field({ label, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Banner({ type = 'success', text, testID }) {
  const success = type === 'success';
  return (
    <Text
      testID={testID}
      style={[styles.banner, { color: success ? colors.success : colors.danger, backgroundColor: success ? colors.successBg : colors.dangerBg }]}
    >
      {text}
    </Text>
  );
}

export function Select({ label, value, options, placeholder, onChange, error, testID, optionTestIDPrefix }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.selectBox, error ? styles.inputError : null]}
      >
        <Text style={value ? styles.selectValue : styles.selectPlaceholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.selectList}>
          <Pressable
            testID={`${optionTestIDPrefix}-empty`}
            style={styles.option}
            onPress={() => {
              onChange('');
              setOpen(false);
            }}
          >
            <Text style={[styles.optionText, styles.selectPlaceholder]}>{placeholder}</Text>
          </Pressable>
          {options.map((opt) => (
            <Pressable
              key={opt}
              testID={`${optionTestIDPrefix}-${opt}`}
              style={styles.option}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function StarButton({ active, onToggle, testID = 'favorite-toggle', size = 22 }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ checked: active }}
      accessibilityLabel={active ? 'Remove from favorites' : 'Add to favorites'}
      testID={testID}
      onPress={onToggle}
      hitSlop={8}
      style={styles.star}
    >
      <Text style={{ color: active ? colors.star : '#B4BCCB', fontSize: size + 4 }}>{active ? '★' : '☆'}</Text>
    </Pressable>
  );
}

export function ChipRow({ label, options, value, onChange, testIdPrefix }) {
  return (
    <View style={styles.chipSection}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.chipWrap}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              testID={`${testIdPrefix}-${opt}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(opt)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Badge({ text }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

export function SwitchRow({ label, value, onValueChange, testID }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#CBD3E1', true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#CBD3E1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonSmall: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  buttonLabel: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSizes.body,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.xs + 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.small,
    marginTop: spacing.xs + 2,
  },
  banner: {
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSizes.small,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  selectBox: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
  },
  selectValue: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  selectPlaceholder: {
    fontSize: fontSizes.body,
    color: '#9AA3B2',
  },
  chevron: {
    fontSize: fontSizes.xsmall,
    color: colors.muted,
  },
  selectList: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  star: {
    padding: spacing.xs,
  },
  chipSection: {
    marginBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSizes.small,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: fontSizes.xsmall,
    color: colors.muted,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  switchLabel: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
});
