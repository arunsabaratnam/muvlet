import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Sheet } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';

import { CoachFace } from './coach-face';
import { previewOf, type Step } from './day';
import { UpArrow } from './icons';

type PreviewSheetProps = {
  /** The step to preview. The sheet closes when it's undefined. */
  step?: Step;
  onStart: (step: Step) => void;
  onClose: () => void;
};

/** What's in a workout or stretch, to look over before you start it (mockup v38). */
export function PreviewSheet({ step, onStart, onClose }: PreviewSheetProps) {
  // Keeps showing the last step while the sheet slides away.
  const [last, setLast] = useState(step);
  if (step && step !== last) setLast(step);
  const shown = step ?? last;
  const preview = shown && previewOf(shown);

  return (
    <Sheet
      visible={!!step && !!previewOf(step)}
      onClose={onClose}
      header={
        shown && preview ? (
          <View style={styles.top}>
            <CoachFace coach={shown.coach} size={62} zoom={0.75} />
            <View style={styles.heading}>
              <Text style={styles.kind}>{preview.kind}</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {shown.title}
              </Text>
              <Text style={styles.focus}>{preview.focus}</Text>
            </View>
          </View>
        ) : null
      }>
      {shown && preview ? (
        <>
          <View style={styles.chips}>
            {preview.chips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
            {preview.up ? (
              <View style={[styles.chip, styles.upChip]}>
                <UpArrow size={13} color={colors.success} />
                <Text style={styles.upText}>{preview.up}</Text>
              </View>
            ) : null}
          </View>
          <ScrollView style={styles.list}>
            {preview.items.map((item, index) => (
              <View key={item.name} style={[styles.item, index > 0 && styles.divider]}>
                <View style={[styles.number, { backgroundColor: coachColors[shown.coach].wash }]}>
                  <Text style={[styles.numberText, { color: coachColors[shown.coach].ink }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>{item.detail}</Text>
                </View>
                {item.up ? (
                  <View accessibilityLabel={`Up ${item.up}`} style={styles.up}>
                    <UpArrow size={13} color={colors.success} />
                    <Text style={styles.upText}>{item.up}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
          <Text style={styles.need}>{preview.need}</Text>
          <Button title={shown.action} onPress={() => onStart(shown)} />
        </>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  heading: {
    flex: 1,
  },
  kind: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 11.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  title: {
    marginTop: 1,
    marginBottom: 2,
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 27,
    color: colors.text,
  },
  focus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 99,
    backgroundColor: colors.surfaceMuted,
  },
  chipText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12.5,
    color: colors.text,
  },
  upChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 174, 107, 0.14)',
  },
  // A long list scrolls; the button stays put.
  list: {
    flexShrink: 1,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
  },
  divider: {
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
  },
  number: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: fonts.headingHeavy,
    fontSize: 16,
  },
  itemText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    lineHeight: 18,
    color: colors.text,
  },
  detail: {
    marginTop: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  up: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  upText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12.5,
    color: colors.success,
  },
  need: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
