import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button, Sheet } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';

import { CoachFace } from './coach-face';
import { formatDay } from './day';
import { CARD_COACH, type CardKey } from './days';
import { Press } from './press';
import type { CardAction } from './use-day';

type Choice = { label: string; action: CardAction };

// A choice in Other options waits for the sheet to slide away.
const AFTER_SHEET_MS = 260;

type CardText = {
  /** Before, in and after the coloured words. */
  text: [string, string, string];
  main: Choice;
  /** Behind "Other options". */
  others: Choice[];
};

function cardText(card: Exclude<CardKey, 'rest'>, pausedUntil?: Date): CardText {
  if (card === 'missed') {
    return {
      text: ['Yesterday got busy? ', 'Push Day A', ' is still here for you.'],
      main: { label: 'Do it today', action: 'today' },
      others: [
        { label: 'Move it to Thursday', action: 'move' },
        { label: 'Skip it', action: 'skip' },
      ],
    };
  }
  if (card === 'back') {
    return {
      text: ['', 'Welcome back!', " Let's ease in. I've made this week's weights a bit lighter."],
      main: { label: 'Ease back in', action: 'ease' },
      others: [{ label: 'Pick up where I left off', action: 'pick' }],
    };
  }
  return {
    text: [
      'Plan paused until ',
      pausedUntil ? formatDay(pausedUntil) : 'you say',
      '. Log meals only if you want to.',
    ],
    main: { label: 'Resume now', action: 'resume' },
    others: [],
  };
}

type CoachCardProps = {
  card: CardKey;
  pausedUntil?: Date;
  onAct: (action: CardAction) => void;
};

/**
 * A coach's card above the path when the day didn't go to plan: one button, and the rest
 * behind "Other options". On a rest day it's a quiet note instead.
 */
export function CoachCard({ card, pausedUntil, onAct }: CoachCardProps) {
  const [choosing, setChoosing] = useState(false);
  const [chosen, setChosen] = useState<CardAction>();
  useEffect(() => {
    if (!chosen) return;
    const timer = setTimeout(() => onAct(chosen), AFTER_SHEET_MS);
    return () => clearTimeout(timer);
  }, [chosen, onAct]);
  if (card === 'rest') return <RestDay />;

  const coach = CARD_COACH[card];
  const { text, main, others } = cardText(card, pausedUntil);
  const { ink, shade, wash } = coachColors[coach];
  return (
    // The border is the coach's colour at 45%.
    <View style={[styles.card, { borderColor: `${ink}73` }]}>
      <View style={styles.top}>
        <CoachFace coach={coach} size={44} tint={wash} />
        <Text style={styles.text}>
          {text[0]}
          <Text style={{ color: ink }}>{text[1]}</Text>
          {text[2]}
        </Text>
      </View>
      <View style={styles.buttons}>
        <Press
          accessibilityRole="button"
          onPress={() => onAct(main.action)}
          style={[styles.main, { backgroundColor: ink, boxShadow: `0 4px 0 ${shade}` }]}>
          <Text style={styles.mainText}>{main.label}</Text>
        </Press>
        {others.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => setChoosing(true)}
            style={({ pressed }) => [styles.other, pressed && styles.pressed]}>
            <Text style={styles.otherText}>Other options</Text>
          </Pressable>
        ) : null}
      </View>
      <Sheet
        visible={choosing}
        onClose={() => setChoosing(false)}
        header={
          <Text accessibilityRole="header" style={styles.sheetTitle}>
            Other options
          </Text>
        }>
        <View style={styles.choices}>
          {others.map((choice) => (
            <Press
              key={choice.action}
              accessibilityRole="button"
              onPress={() => {
                setChoosing(false);
                setChosen(choice.action);
              }}
              style={styles.choice}>
              <Text style={styles.choiceText}>{choice.label}</Text>
            </Press>
          ))}
        </View>
        <Button title="Keep it as is" variant="secondary" onPress={() => setChoosing(false)} />
      </Sheet>
    </View>
  );
}

/** Nothing to tick today, and that's the plan. */
function RestDay() {
  return (
    <View accessible style={styles.rest}>
      <View style={[styles.moon, { backgroundColor: coachColors.luna.wash }]}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill={coachColors.luna.ink} />
        </Svg>
      </View>
      <View style={styles.restText}>
        <Text style={styles.restTitle}>Rest day</Text>
        <Text style={styles.restDetail}>
          Nothing to tick today. Rest days count toward your streak.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    lineHeight: 19,
    color: colors.text,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  mainText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14.5,
    lineHeight: 20,
    color: colors.onPrimary,
  },
  other: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  otherText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.6,
  },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text,
  },
  choices: {
    gap: 8,
  },
  choice: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  choiceText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    color: colors.text,
  },
  rest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  moon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restText: {
    flex: 1,
  },
  restTitle: {
    fontFamily: fonts.headingHeavy,
    fontSize: 16,
    color: colors.text,
  },
  restDetail: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
