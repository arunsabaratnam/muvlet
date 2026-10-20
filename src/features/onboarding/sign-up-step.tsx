import { router } from 'expo-router';
import { useRef, useState, type ReactNode, type Ref } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';

import { BackIcon, EyeIcon, EyeOffIcon, TickIcon } from './icons';

/* Sign up with email, from Save your plan (mockup screen 14). There are no accounts yet, so
   Create account checks the form and moves on; nothing typed here is kept. */

export function isEmail(text: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text.trim());
}

/** 0 when too short, then 1 to 3 as it gets stronger, like the mockup. */
export function passwordStrength(password: string) {
  if (password.length < 8) return 0;
  const mixed = /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
  const long = password.length >= 12 || /[^a-zA-Z0-9]/.test(password);
  return 1 + (mixed ? 1 : 0) + (long ? 1 : 0);
}

const STRENGTH_HINTS = [
  'Too short. Use 8 or more characters.',
  'Okay. Add a number to make it stronger.',
  'Good password.',
  'Strong password.',
];
const STRENGTH_COLORS = [colors.danger, colors.warning, colors.success];

export function SignUpStep() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tips, setTips] = useState(true);
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);

  const strength = passwordStrength(password);
  const ready = !!name.trim() && isEmail(email) && password.length >= 8;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.form,
        { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28 },
      ]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => router.back()}
        style={styles.back}>
        <BackIcon color={colors.textMuted} size={26} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>
        Sign up with email
      </Text>
      <Field
        label="What should we call you?"
        value={name}
        onChangeText={setName}
        placeholder="First name"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailInput.current?.focus()}
      />
      <Field
        ref={emailInput}
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordInput.current?.focus()}
      />
      <Field
        ref={passwordInput}
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="8 or more characters"
        autoComplete="new-password"
        textContentType="newPassword"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        accessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eye}>
            {showPassword ? (
              <EyeOffIcon color={colors.textMuted} />
            ) : (
              <EyeIcon color={colors.textMuted} />
            )}
          </Pressable>
        }
      />
      <View style={styles.strength}>
        {STRENGTH_COLORS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              !!password &&
                i < Math.max(strength, 1) && {
                  backgroundColor: STRENGTH_COLORS[Math.min(strength, 2)],
                },
            ]}
          />
        ))}
      </View>
      <Text style={styles.hint}>
        {password ? STRENGTH_HINTS[strength] : 'Use 8 or more characters.'}
      </Text>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: tips }}
        onPress={() => setTips(!tips)}
        style={styles.check}>
        <View style={[styles.box, tips && styles.boxOn]}>
          {tips ? <TickIcon color={colors.onPrimary} size={14} /> : null}
        </View>
        <Text style={styles.checkLabel}>Send me gentle tips and reminders from the crew</Text>
      </Pressable>
      <View style={styles.bottom}>
        <Button
          title="Create account"
          color={coachColors.rex}
          disabled={!ready}
          onPress={() => router.push('/onboarding/reminders')}
        />
        <Text style={styles.fine}>
          By continuing you agree to Muvlet&apos;s <Text style={styles.fineLink}>Terms</Text> and{' '}
          <Text style={styles.fineLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  accessory,
  ref,
  ...input
}: TextInputProps & { label: string; accessory?: ReactNode; ref?: Ref<TextInput> }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, focused && styles.inputFocused]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.inputText}
          {...input}
        />
        {accessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  form: {
    flexGrow: 1,
    gap: 14,
    paddingHorizontal: 22,
  },
  back: {
    alignSelf: 'flex-start',
    marginLeft: -6,
    paddingVertical: 11,
  },
  title: {
    fontFamily: fonts.headingHeavy,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: coachColors.rex.ink,
  },
  inputText: {
    flex: 1,
    padding: 14,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  eye: {
    height: 48,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  strength: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
  },
  hint: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  check: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  box: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    borderColor: coachColors.rex.ink,
    backgroundColor: coachColors.rex.ink,
  },
  checkLabel: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.textMuted,
  },
  bottom: {
    marginTop: 'auto',
    gap: 14,
  },
  fine: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  fineLink: {
    fontFamily: fonts.bodyExtraBold,
    color: coachColors.rex.ink,
  },
});
