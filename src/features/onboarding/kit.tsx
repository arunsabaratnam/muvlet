import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';

import { BODY_ONLY } from './answers';
import type { Tint } from './controls';
import {
  AbWheelIcon,
  BandsIcon,
  BarbellIcon,
  BenchIcon,
  BoxIcon,
  CableMachineIcon,
  CardioIcon,
  DumbbellIcon,
  KettlebellIcon,
  MedicineBallIcon,
  PlateIcon,
  PlusIcon,
  PullUpBarIcon,
  SearchIcon,
  SquatRackIcon,
  StrapsIcon,
  TickIcon,
} from './icons';
import { BottomSheet } from './sheet';

/* The kit on What's at home: the usual kit as tiles, and a sheet for the rest. */

export type Kit = { name: string; tint: Tint; icon?: (color: string) => ReactNode };

// Each piece of kit takes a coach's colours in turn, like the goal rows.
const WELLS: Tint[] = [coachColors.rex, coachColors.sage, coachColors.luna];

function inTurn(list: Omit<Kit, 'tint'>[]): Kit[] {
  return list.map((kit, i) => ({ ...kit, tint: WELLS[i % WELLS.length] }));
}

/** The kit most homes have, shown as tiles. */
export const HOME_KIT = inTurn([
  { name: 'Dumbbells', icon: (color) => <DumbbellIcon color={color} size={24} /> },
  { name: 'Bands', icon: (color) => <BandsIcon color={color} /> },
  { name: 'Kettlebells', icon: (color) => <KettlebellIcon color={color} /> },
  { name: 'Bench', icon: (color) => <BenchIcon color={color} /> },
  { name: 'Pull-up bar', icon: (color) => <PullUpBarIcon color={color} /> },
  { name: 'Barbell', icon: (color) => <BarbellIcon color={color} /> },
  { name: 'Squat rack', icon: (color) => <SquatRackIcon color={color} /> },
  { name: 'Cardio machine', icon: (color) => <CardioIcon color={color} /> },
]);

// Less common kit, listed in the More kit sheet.
const MORE_KIT = inTurn([
  { name: 'Cable machine', icon: (color) => <CableMachineIcon color={color} /> },
  { name: 'Medicine ball', icon: (color) => <MedicineBallIcon color={color} /> },
  { name: 'Suspension straps', icon: (color) => <StrapsIcon color={color} /> },
  { name: 'Plyo box or step', icon: (color) => <BoxIcon color={color} /> },
  { name: 'Ab wheel', icon: (color) => <AbWheelIcon color={color} /> },
  { name: 'Weight plates', icon: (color) => <PlateIcon color={color} /> },
]);

/** Ticked kit that isn't a tile: picked in the sheet, or typed in. */
export function extrasIn(equipment: string[]) {
  return equipment.filter(
    (item) => item !== BODY_ONLY && !HOME_KIT.some((kit) => kit.name === item),
  );
}

/** A piece of kit's icon in a round well of its colour. */
export function KitWell({ kit, size = 40 }: { kit: Kit; size?: number }) {
  return (
    <View
      style={[
        styles.well,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: kit.tint.wash },
      ]}>
      {kit.icon ? (
        kit.icon(kit.tint.ink)
      ) : (
        // Kit someone typed in has no drawing, so it shows its first letter.
        <Text style={[styles.letter, { color: kit.tint.ink }]}>{kit.name[0]}</Text>
      )}
    </View>
  );
}

export function KitSheet({
  visible,
  value,
  tint,
  onToggle,
  onClose,
}: {
  visible: boolean;
  value: string[];
  tint: Tint;
  onToggle: (item: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} title="More kit" onClose={onClose}>
      <KitSearch value={value} tint={tint} onToggle={onToggle} />
      <Button title="Done" color={tint} onPress={onClose} />
    </BottomSheet>
  );
}

function KitSearch({
  value,
  tint,
  onToggle,
}: {
  value: string[];
  tint: Tint;
  onToggle: (item: string) => void;
}) {
  const { height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const keyboardUp = useKeyboardUp();

  const typed = query.trim();
  // Saved in sentence case, like the rest of the kit.
  const ownName = typed.charAt(0).toUpperCase() + typed.slice(1);
  const own = inTurn(
    extrasIn(value)
      .filter((item) => !MORE_KIT.some((kit) => kit.name === item))
      .map((name) => ({ name })),
  );
  const listed = [...MORE_KIT, ...own];
  // A search looks through the tiles too, so nothing gets added twice.
  const everything = [...HOME_KIT, ...listed];
  const matches = (kit: Kit) => kit.name.toLowerCase().includes(typed.toLowerCase());
  const shown = typed ? everything.filter(matches) : listed;
  const known = everything.some((kit) => kit.name.toLowerCase() === typed.toLowerCase());

  const addOwn = () => {
    onToggle(ownName);
    setQuery('');
  };

  return (
    <>
      <View style={[styles.search, !!typed && { borderColor: tint.ink }]}>
        <SearchIcon color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search kit"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search kit"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (typed && !known) addOwn();
          }}
          style={styles.input}
        />
      </View>
      {/* Shorter while the keyboard is up, so the sheet still fits above it. */}
      <ScrollView
        style={{ maxHeight: height * (keyboardUp ? 0.2 : 0.36) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {shown.map((kit) => (
          <KitRow
            key={kit.name}
            kit={kit}
            on={value.includes(kit.name)}
            tint={tint}
            onPress={() => onToggle(kit.name)}
          />
        ))}
        {typed && !shown.length ? (
          <Text style={styles.empty}>Nothing on our list matches that.</Text>
        ) : null}
        {typed && !known ? (
          <Pressable
            accessibilityRole="button"
            onPress={addOwn}
            style={({ pressed }) => [
              styles.addOwn,
              { borderColor: tint.ink, borderBottomColor: tint.shade, backgroundColor: tint.wash },
              pressed && styles.pressed,
            ]}>
            <View style={[styles.addIcon, { backgroundColor: tint.ink }]}>
              <PlusIcon color={colors.onPrimary} size={18} />
            </View>
            <Text style={[styles.addLabel, { color: tint.shade }]}>Add “{ownName}”</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </>
  );
}

function KitRow({
  kit,
  on,
  tint,
  onPress,
}: {
  kit: Kit;
  on: boolean;
  tint: Tint;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={kit.name}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={styles.row}>
      <KitWell kit={kit} size={34} />
      <Text style={styles.rowLabel}>{kit.name}</Text>
      <View style={[styles.tick, on && { borderColor: tint.shade, backgroundColor: tint.ink }]}>
        {on ? (
          <TickIcon color={colors.onPrimary} size={14} />
        ) : (
          <PlusIcon color={colors.textMuted} size={14} />
        )}
      </View>
    </Pressable>
  );
}

function useKeyboardUp() {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setUp(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return up;
}

const styles = StyleSheet.create({
  well: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: fonts.headingHeavy,
    fontSize: 17,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.surfaceMuted,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
    color: colors.text,
  },
  tick: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  empty: {
    marginTop: 4,
    marginBottom: 12,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  addOwn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    marginTop: 8,
    paddingLeft: 9,
    paddingRight: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  addIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  addLabel: {
    flex: 1,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
  },
  pressed: {
    transform: [{ translateY: 3 }],
  },
});
