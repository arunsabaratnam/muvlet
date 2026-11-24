import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fonts,
  levelColors,
  plateColors,
  prColors,
  workoutChipColors,
  workoutColors,
} from '@/constants/theme';
import { withCommas } from '@/features/onboarding/plan';
import { MOCK_POINTS } from '@/features/today/day';

import { Barbell } from './barbell';
import { weeksGrid } from './heatmap';
import { KINDS, mockHistory } from './history';
import { levelFor, WORKOUT_POINTS, type Level } from './levels';
import { BADGE_COUNT, MOCK_BADGES, MOCK_PRS, type Badge, type PR } from './records';
import { WeeksGrid } from './weeks-grid';

const KIND_NAMES = { push: 'Push', pull: 'Pull', legs: 'Legs', stretch: 'Stretch' } as const;

/**
 * Your level and barbell, the last 16 weeks coloured by what you trained, your PRs and your
 * badges. Reads sample data until history is saved on the phone.
 */
export default function ProgressScreen() {
  const points = MOCK_POINTS;
  const level = levelFor(points);
  const grid = useMemo(() => {
    const now = new Date();
    return weeksGrid(mockHistory(now), now);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Progress
        </Text>
        <LevelPanel level={level} points={points} />

        <View style={styles.panel}>
          <Text accessibilityRole="header" style={styles.heading}>
            Last 16 weeks
          </Text>
          <WeeksGrid grid={grid} />
          <View style={styles.chips}>
            {KINDS.map((kind) => (
              <View
                key={kind}
                style={[styles.chip, { backgroundColor: workoutChipColors[kind].wash }]}>
                <View style={[styles.swatch, { backgroundColor: workoutColors[kind] }]} />
                <Text style={[styles.chipText, { color: workoutChipColors[kind].ink }]}>
                  {KIND_NAMES[kind]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.panel, styles.prPanel]}>
          <Text accessibilityRole="header" style={styles.heading}>
            PRs
          </Text>
          {MOCK_PRS.map((pr, index) => (
            <PRRow key={pr.name} pr={pr} first={index === 0} />
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.headRow}>
            <Text accessibilityRole="header" style={styles.heading}>
              Badges
            </Text>
            <Text style={styles.muted}>
              {`${MOCK_BADGES.filter((badge) => badge.earned).length} of ${BADGE_COUNT}`}
            </Text>
          </View>
          <View style={styles.badges}>
            {MOCK_BADGES.map((badge) => (
              <BadgeDisc key={badge.name} badge={badge} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Your level, your barbell and how far it is to the next level. */
function LevelPanel({ level, points }: { level: Level; points: number }) {
  const share = level.to ? Math.min(1, (points - level.from) / (level.to - level.from)) : 1;
  const workouts = level.to ? Math.max(1, Math.ceil((level.to - points) / WORKOUT_POINTS)) : 0;
  const toNext = !level.next
    ? 'Top level. PRs keep counting.'
    : level.weeksToGo && points >= (level.to ?? 0)
      ? `${level.weeksToGo} more kept ${level.weeksToGo === 1 ? 'week' : 'weeks'} to ${level.next}`
      : `About ${workouts} ${workouts === 1 ? 'workout' : 'workouts'} to ${level.next}`;
  // Past the next level's points while kept weeks hold it back, the total is just the points.
  const total =
    level.to && points < level.to
      ? `${withCommas(points)} / ${withCommas(level.to)}`
      : withCommas(points);

  return (
    <View
      style={styles.panel}
      accessible
      accessibilityLabel={`Level ${level.number}, ${level.name}. ${toNext}. ${total} points.`}>
      <View style={styles.levelTop}>
        <View style={styles.badge}>
          <Text style={styles.badgeNumber}>{level.number}</Text>
        </View>
        <Text style={styles.levelName}>{level.name}</Text>
      </View>
      <Barbell level={level.number} />
      <View style={styles.progress}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${share * 100}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.toNext}>{toNext}</Text>
          <Text style={styles.muted}>{total}</Text>
        </View>
      </View>
    </View>
  );
}

function PRRow({ pr, first }: { pr: PR; first: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${pr.name}, ${pr.value}, ${pr.up}`}
      style={[styles.prRow, first ? null : styles.prRule]}>
      <View style={styles.prIcon}>
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path
            d="M12 19V5M6 11l6-6 6 6"
            fill="none"
            stroke={prColors.ink}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={styles.prText}>
        <Text style={styles.prName}>{pr.name}</Text>
        <Text style={styles.prValue}>{pr.value}</Text>
      </View>
      <Text style={styles.prUp}>{pr.up}</Text>
    </View>
  );
}

/** A badge, drawn as a plate: in its metal once earned, a grey outline until then. */
function BadgeDisc({ badge }: { badge: Badge }) {
  const color = plateColors[badge.metal];
  return (
    <View
      accessible
      accessibilityLabel={`${badge.name}${badge.earned ? '' : ', not earned yet'}`}
      style={styles.badgeCell}>
      <View style={[styles.disc, badge.earned ? { backgroundColor: color } : styles.discLocked]}>
        <View style={[styles.ring, badge.earned ? styles.ringEarned : styles.ringLocked]} />
        <Text
          style={[
            styles.mark,
            {
              color: badge.earned
                ? badge.metal === 'gold'
                  ? plateColors.goldInk
                  : colors.onPrimary
                : colors.textFaint,
            },
          ]}>
          {badge.mark}
        </Text>
        <View style={[styles.hub, badge.earned ? styles.hubEarned : styles.hubLocked]} />
      </View>
      <Text style={[styles.badgeName, { color: badge.earned ? colors.text : colors.textMuted }]}>
        {badge.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    marginHorizontal: 4,
    fontFamily: fonts.headingHeavy,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: colors.text,
  },
  // A 2px border with a 6px ledge underneath, like the level card on Today.
  panel: {
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heading: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 19,
    color: colors.text,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  muted: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  levelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: levelColors.fill,
  },
  badgeNumber: {
    fontFamily: fonts.headingHeavy,
    fontSize: 21,
    color: colors.onPrimary,
  },
  levelName: {
    flex: 1,
    fontFamily: fonts.headingHeavy,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: colors.text,
  },
  progress: {
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: levelColors.track,
  },
  fill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: levelColors.fill,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  toNext: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 9,
    paddingRight: 11,
    borderRadius: 99,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  chipText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13.5,
  },
  prPanel: {
    gap: 0,
    paddingBottom: 6,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  prRule: {
    borderTopWidth: 2,
    borderTopColor: colors.surfaceMuted,
  },
  prIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: prColors.wash,
  },
  prText: {
    flex: 1,
  },
  prName: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15.5,
    color: colors.text,
  },
  prValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.textMuted,
  },
  prUp: {
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: prColors.ink,
    backgroundColor: prColors.wash,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  badgeCell: {
    width: '33.33%',
    alignItems: 'center',
    gap: 8,
  },
  disc: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discLocked: {
    borderWidth: 2,
    borderColor: colors.disabledEdge,
    backgroundColor: colors.surface,
  },
  ring: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    bottom: 9,
    borderRadius: 30,
  },
  ringEarned: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  ringLocked: {
    borderWidth: 1.5,
    borderColor: colors.disabled,
  },
  mark: {
    top: -9,
    fontFamily: fonts.headingHeavy,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  hub: {
    position: 'absolute',
    bottom: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  hubEarned: {
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.18)',
  },
  hubLocked: {
    borderWidth: 1.5,
    borderColor: colors.disabledEdge,
  },
  badgeName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textAlign: 'center',
  },
});
