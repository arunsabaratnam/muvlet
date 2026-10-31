import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
  type AnimatedRef,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

import { CoachFace } from './coach-face';
import {
  canLetGo,
  doneLabel,
  doneText,
  isLapsed,
  isQuiet,
  previewOf,
  stepText,
  type Section,
  type Step,
  type StepId,
} from './day';
import { Chevron } from './icons';
import { Press } from './press';
import { WorkoutCard } from './workout-card';

// Things slide to where they now belong instead of jumping (mockup FLIP: 460 ms).
export const MOVE = LinearTransition.duration(460).easing(Easing.bezier(0.22, 1, 0.36, 1));
const FOLD = FadeOut.duration(380);
const POP = ZoomIn.springify().damping(11).stiffness(260);

type DayPathProps = {
  sections: Section[];
  /** All of today's steps, for text that depends on other steps. */
  steps: Step[];
  /** Minutes after midnight. */
  now: number;
  /** While the plan is paused, meals are optional quiet lines. */
  paused: boolean;
  next?: Step;
  openId?: StepId;
  /** Just finished: shows done for a moment before folding into its section's chip. */
  justDone?: StepId;
  expanded: string[];
  /** On the big workout card, to tell when it has scrolled out of sight. */
  workoutRef?: AnimatedRef;
  onOpen: (id: StepId) => void;
  onPreview: (step: Step) => void;
  onFinish: (step: Step) => void;
  onSkip: (step: Step) => void;
  onUndo: (step: Step) => void;
  onToggleSection: (title: string) => void;
};

/** Today's steps in Morning, Afternoon, Evening and Before bed. */
export function DayPath({ sections, expanded, onToggleSection, ...rest }: DayPathProps) {
  return (
    <View style={styles.path}>
      {sections.map((section) => {
        const folded = section.steps.filter(
          (s) => s.doneAt !== undefined && s.id !== rest.justDone,
        );
        const open = expanded.includes(section.title);
        const shown = open ? section.steps : section.steps.filter((s) => !folded.includes(s));
        return (
          <Animated.View key={section.title} layout={MOVE} style={styles.section}>
            <View style={styles.header}>
              <Text style={[styles.title, section.past && styles.pastTitle]}>{section.title}</Text>
              {folded.length > 0 ? (
                <Animated.View key={doneLabel(folded)} entering={POP}>
                  <Press
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    onPress={() => onToggleSection(section.title)}
                    style={styles.chip}>
                    <Tick size={14} color={colors.success} width={3} />
                    <Text style={styles.chipText}>{doneLabel(folded)}</Text>
                  </Press>
                </Animated.View>
              ) : null}
            </View>
            {shown.length > 0 ? (
              <View style={styles.steps}>
                <View style={styles.line}>
                  <Svg width="100%" height="100%">
                    <Line
                      x1={1.25}
                      y1={0}
                      x2={1.25}
                      y2="100%"
                      stroke={colors.border}
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                    />
                  </Svg>
                </View>
                {shown.map((step) => (
                  <Animated.View
                    key={step.id}
                    layout={MOVE}
                    entering={FadeIn.duration(300)}
                    exiting={FOLD}
                    style={styles.row}>
                    <StepRow step={step} {...rest} />
                  </Animated.View>
                ))}
              </View>
            ) : null}
          </Animated.View>
        );
      })}
    </View>
  );
}

function StepRow({
  step,
  steps,
  now,
  paused,
  next,
  openId,
  justDone,
  workoutRef,
  onOpen,
  onPreview,
  onFinish,
  onSkip,
  onUndo,
}: Omit<DayPathProps, 'sections' | 'expanded' | 'onToggleSection'> & { step: Step }) {
  const done = step.doneAt !== undefined;
  const ended = doneText(step);
  const open = step.id === (openId ?? next?.id) || step.id === justDone;
  const { detail } = stepText(step, steps);
  const preview = previewOf(step);

  // A meal whose time has passed, or one that's optional on a break: one quiet line.
  if (isQuiet(step, now, paused)) {
    return (
      <View style={styles.quiet}>
        <View style={[styles.dot, styles.quietDot]} />
        <Text style={styles.quietText}>
          {`${step.name} · ${isLapsed(step, now) ? 'log it later' : 'optional'}`}
        </Text>
        <Press
          accessibilityRole="button"
          accessibilityLabel={`Log ${step.name.toLowerCase()}`}
          onPress={() => onFinish(step)}
          style={styles.logIt}>
          <Text style={styles.logItText}>Log it</Text>
        </Press>
      </View>
    );
  }

  return (
    <>
      <View
        style={[
          styles.dot,
          step.id === next?.id && styles.dotNow,
          done && (step.skipped ? styles.dotSkipped : styles.dotDone),
        ]}>
        {done ? (
          <Animated.View entering={step.id === justDone ? POP : undefined}>
            <Tick size={13} color="#FFFFFF" width={3.5} />
          </Animated.View>
        ) : null}
      </View>
      {open && !done && step.id === 'workout' ? (
        <WorkoutCard
          step={step}
          cardRef={workoutRef}
          onStart={() => onFinish(step)}
          onPreview={() => onPreview(step)}
        />
      ) : open ? (
        <View style={[styles.card, styles.openCard, done && styles.doneCard]}>
          <View style={styles.info}>
            <Text style={styles.cardTitle}>{done ? ended.title : step.title}</Text>
            <Text style={styles.detail}>{done ? ended.detail : detail}</Text>
            {done ? (
              step.id !== justDone && (
                <Text
                  accessibilityRole="button"
                  onPress={() => onUndo(step)}
                  suppressHighlighting
                  style={styles.undo}>
                  Undo
                </Text>
              )
            ) : (
              <>
                {preview ? (
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => onPreview(step)}
                    style={({ pressed }) => [styles.see, pressed && styles.pressed]}>
                    <Text style={styles.seeText}>{`See ${preview.items.length} moves`}</Text>
                    <Chevron size={14} color={colors.primary} />
                  </Pressable>
                ) : null}
                <Press
                  accessibilityRole="button"
                  onPress={() => onFinish(step)}
                  style={styles.action}>
                  <Text style={styles.actionText}>{step.action}</Text>
                </Press>
                {canLetGo(step, now) ? (
                  <Text
                    accessibilityRole="button"
                    onPress={() => onSkip(step)}
                    suppressHighlighting
                    style={styles.letGo}>
                    Not tonight
                  </Text>
                ) : null}
              </>
            )}
          </View>
          <CoachFace coach={step.coach} size={52} />
        </View>
      ) : (
        <Press
          accessibilityRole="button"
          accessibilityHint="Opens this step"
          onPress={() => onOpen(step.id)}
          style={[styles.card, done && styles.foldedCard]}>
          <View style={styles.info}>
            <Text style={styles.cardTitle}>{done ? ended.title : step.title}</Text>
            {done ? <Text style={styles.result}>{ended.detail}</Text> : null}
          </View>
          <CoachFace coach={step.coach} size={34} />
        </Press>
      )}
    </>
  );
}

function Tick({ size, color, width }: { size: number; color: string; width: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12l5 5 9-10"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  path: {
    gap: 16,
  },
  section: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 30,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: fonts.headingHeavy,
    fontSize: 19,
    color: colors.text,
  },
  pastTitle: {
    fontSize: 16.5,
    color: colors.textMuted,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingLeft: 7,
    paddingRight: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(47, 174, 107, 0.13)',
  },
  chipText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.success,
  },
  steps: {
    paddingLeft: 32,
  },
  // The dashed line that joins the dots.
  line: {
    position: 'absolute',
    left: 10.5,
    top: 30,
    bottom: 30,
    width: 3,
  },
  row: {
    justifyContent: 'center',
    paddingVertical: 5,
  },
  dot: {
    position: 'absolute',
    left: -32,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNow: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    boxShadow: '0 0 0 5px rgba(63, 109, 243, 0.2)',
  },
  dotDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
    boxShadow: 'none',
  },
  dotSkipped: {
    borderColor: colors.textFaint,
    backgroundColor: colors.textFaint,
    boxShadow: 'none',
  },
  quiet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 4,
    paddingRight: 2,
  },
  // Smaller than the other dots, on the same line.
  quietDot: {
    left: -27,
    width: 14,
    height: 14,
    borderColor: 'rgba(102, 116, 135, 0.45)',
  },
  quietText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  logIt: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 99,
    backgroundColor: colors.surfaceMuted,
  },
  logItText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.text,
  },
  letGo: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  openCard: {
    borderColor: colors.primary,
  },
  doneCard: {
    borderColor: colors.success,
  },
  foldedCard: {
    opacity: 0.75,
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 18.5,
    color: colors.text,
  },
  detail: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  result: {
    marginTop: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  see: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    paddingTop: 6,
    paddingBottom: 2,
  },
  seeText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13.5,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  action: {
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: colors.primary,
    boxShadow: '0 6px 16px rgba(63, 109, 243, 0.3)',
  },
  actionText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onPrimary,
  },
  undo: {
    alignSelf: 'flex-start',
    marginTop: 2,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
