import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';

import { useAnswers, type Reminders, type TimeOfDay } from './answers';
import { Section, Segmented, TextButton } from './controls';
import { usePlayCoach } from './onboarding-layout';
import { buildPlan } from './plan';
import { StepScreen } from './step-screen';
import { goOn } from './steps';

/* Luna's last question (design spec 4.2). Picking how she nudges you shows the phone's own
   notification prompt; reminders themselves aren't scheduled yet. */

const HINTS: Record<Reminders, string> = {
  Gentle: 'A friendly reminder on training days only.',
  Regular: 'Reminders for workouts, meals and water.',
  Off: "No reminders. You'll check in yourself.",
};

const TIMES: Record<TimeOfDay, string> = { Morning: '7 AM', Lunch: '12 PM', Evening: '6 PM' };

const JUMP_BEFORE_LEAVING_MS = 500;

/** Shows the phone's notification prompt. Android 13+ only shows it once a channel exists. */
async function askForNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  } catch {
    // No prompt on this platform: carry on without reminders.
    return false;
  }
}

export function RemindersStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const [asking, setAsking] = useState(false);
  const firstWorkout = buildPlan(answers).week.find((day) => day.kind === 'workout')?.label;
  const examples: Record<Reminders, string | null> = {
    Gentle: `${firstWorkout} day at ${TIMES[answers.time]}. Ready when you are.`,
    Regular: "Lunch time. Snap your meal and I'll count it.",
    Off: null,
  };
  const example = examples[answers.reminders];

  async function turnOn() {
    setAsking(true);
    if (await askForNotifications()) {
      play('jump');
      setTimeout(() => goOn('reminders'), JUMP_BEFORE_LEAVING_MS);
    } else {
      update({ reminders: 'Off' });
      goOn('reminders');
    }
  }

  return (
    <StepScreen
      footer={
        <>
          <Button
            title={example ? 'Turn on reminders' : 'Continue'}
            color={coachColors.luna}
            disabled={asking}
            onPress={example ? turnOn : () => goOn('reminders')}
          />
          <TextButton
            title="Not now"
            onPress={() => {
              update({ reminders: 'Off' });
              goOn('reminders');
            }}
          />
        </>
      }>
      {example ? <ExampleReminder key="example" message={example} /> : null}
      <Section key="choice" hint={HINTS[answers.reminders]}>
        <Segmented
          options={['Gentle', 'Regular', 'Off'] as const}
          value={answers.reminders}
          tint={coachColors.luna}
          onChange={(reminders) => {
            update({ reminders });
            play('nod');
          }}
        />
      </Section>
    </StepScreen>
  );
}

/** What one of Luna's reminders would look like on the lock screen. */
function ExampleReminder({ message }: { message: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`Example reminder from Luna: ${message}`}
      style={styles.reminder}>
      <View style={styles.appIcon}>
        <Text style={styles.appLetter}>m</Text>
      </View>
      <View style={styles.reminderText}>
        <View style={styles.reminderTop}>
          <Text style={styles.meta}>Muvlet</Text>
          <Text style={styles.meta}>now</Text>
        </View>
        <Text style={styles.sender}>Luna</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    boxShadow: '0 5px 12px -6px rgba(30, 40, 80, 0.25)',
  },
  appIcon: {
    width: 35,
    height: 35,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: coachColors.rex.ink,
  },
  appLetter: {
    fontFamily: fonts.headingHeavy,
    fontSize: 18,
    color: colors.onPrimary,
  },
  reminderText: {
    flex: 1,
  },
  reminderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  meta: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.44,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  sender: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14.5,
    color: colors.text,
  },
  message: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.text,
  },
});
