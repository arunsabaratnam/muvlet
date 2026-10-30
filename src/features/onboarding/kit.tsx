import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  CloseIcon,
  DipStationIcon,
  DumbbellIcon,
  EzBarIcon,
  FoamRollerIcon,
  JumpRopeIcon,
  KettlebellIcon,
  LegPressIcon,
  MedicineBallIcon,
  ParallettesIcon,
  PlateIcon,
  PlusIcon,
  PullUpBarIcon,
  RingsIcon,
  RowerIcon,
  SandbagIcon,
  SearchIcon,
  SmithMachineIcon,
  SquatRackIcon,
  StrapsIcon,
  TickIcon,
  TreadmillIcon,
  YogaMatIcon,
} from './icons';

/* The kit on What's at home: the usual kit as tiles, and a finder for the rest. */

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

// Everything else, in groups, in the More kit finder.
const GROUPS: { name: string; kit: Kit[] }[] = [
  {
    name: 'Weights',
    kit: inTurn([
      { name: 'Weight plates', icon: (color) => <PlateIcon color={color} /> },
      { name: 'EZ curl bar', icon: (color) => <EzBarIcon color={color} /> },
      { name: 'Medicine ball', icon: (color) => <MedicineBallIcon color={color} /> },
      { name: 'Sandbag', icon: (color) => <SandbagIcon color={color} /> },
    ]),
  },
  {
    name: 'Machines and racks',
    kit: inTurn([
      { name: 'Cable machine', icon: (color) => <CableMachineIcon color={color} /> },
      { name: 'Smith machine', icon: (color) => <SmithMachineIcon color={color} /> },
      { name: 'Leg press', icon: (color) => <LegPressIcon color={color} /> },
      { name: 'Dip station', icon: (color) => <DipStationIcon color={color} /> },
      { name: 'Plyo box or step', icon: (color) => <BoxIcon color={color} /> },
    ]),
  },
  {
    name: 'Bodyweight',
    kit: inTurn([
      { name: 'Suspension straps', icon: (color) => <StrapsIcon color={color} /> },
      { name: 'Gymnastic rings', icon: (color) => <RingsIcon color={color} /> },
      { name: 'Parallettes', icon: (color) => <ParallettesIcon color={color} /> },
      { name: 'Ab wheel', icon: (color) => <AbWheelIcon color={color} /> },
      { name: 'Jump rope', icon: (color) => <JumpRopeIcon color={color} /> },
    ]),
  },
  {
    name: 'Cardio',
    kit: inTurn([
      { name: 'Treadmill', icon: (color) => <TreadmillIcon color={color} /> },
      { name: 'Exercise bike', icon: (color) => <CardioIcon color={color} size={20} /> },
      { name: 'Rowing machine', icon: (color) => <RowerIcon color={color} /> },
    ]),
  },
  {
    name: 'Recovery',
    kit: inTurn([
      { name: 'Foam roller', icon: (color) => <FoamRollerIcon color={color} /> },
      { name: 'Yoga mat', icon: (color) => <YogaMatIcon color={color} /> },
    ]),
  },
];

const LISTED = [...HOME_KIT, ...GROUPS.flatMap((group) => group.kit)];

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Ticked kit that isn't a tile: picked in the finder, or typed in. */
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

/** A full screen for finding any kit, by group or by search, or adding your own. */
export function KitFinder({
  visible,
  ...finder
}: {
  visible: boolean;
  value: string[];
  tint: Tint;
  onToggle: (item: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={finder.onClose}>
      <Finder {...finder} />
    </Modal>
  );
}

// Mounted fresh each time the finder opens, so it starts with an empty search.
function Finder({
  value,
  tint,
  onToggle,
  onClose,
}: {
  value: string[];
  tint: Tint;
  onToggle: (item: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const typed = query.trim();
  // Saved in sentence case, like the rest of the kit.
  const ownName = typed.charAt(0).toUpperCase() + typed.slice(1);
  const own = inTurn(
    extrasIn(value)
      .filter((item) => !LISTED.some((kit) => kit.name === item))
      .map((name) => ({ name })),
  );
  const everything = [...LISTED, ...own];
  // A search looks through the tiles too, so nothing gets added twice.
  const matches = everything.filter((kit) => kit.name.toLowerCase().includes(typed.toLowerCase()));
  const known = everything.some((kit) => same(kit.name, typed));
  const yours = everything.filter((kit) => value.includes(kit.name));

  const addOwn = () => {
    onToggle(ownName);
    setQuery('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <View style={styles.bar}>
        <View style={[styles.search, { borderColor: tint.ink }]}>
          <SearchIcon color={colors.textMuted} />
          <TextInput
            autoFocus
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
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => setQuery('')}
              style={styles.clear}>
              <CloseIcon color={colors.surface} />
            </Pressable>
          ) : null}
        </View>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.done}>
          <Text style={[styles.doneLabel, { color: tint.shade }]}>Done</Text>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
        {typed ? (
          <>
            {matches.map((kit) => (
              <KitRow
                key={kit.name}
                kit={kit}
                query={typed}
                on={value.includes(kit.name)}
                tint={tint}
                onPress={() => onToggle(kit.name)}
              />
            ))}
            {known ? null : (
              <AddOwn name={ownName} quiet={matches.length > 0} tint={tint} onPress={addOwn} />
            )}
          </>
        ) : (
          <>
            {yours.length ? (
              <Group label="Your kit">
                <View style={styles.chips}>
                  {yours.map((kit) => (
                    <Pressable
                      key={kit.name}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${kit.name}`}
                      onPress={() => onToggle(kit.name)}
                      style={[styles.chip, { borderColor: tint.ink, backgroundColor: tint.wash }]}>
                      <KitWell kit={kit} size={28} />
                      <Text style={[styles.chipLabel, { color: tint.shade }]}>{kit.name}</Text>
                      <View style={[styles.chipX, { backgroundColor: tint.ink }]}>
                        <CloseIcon color={colors.surface} size={8} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </Group>
            ) : null}
            {GROUPS.map((group) => (
              <Group key={group.name} label={group.name}>
                {group.kit.map((kit) => (
                  <KitRow
                    key={kit.name}
                    kit={kit}
                    on={value.includes(kit.name)}
                    tint={tint}
                    onPress={() => onToggle(kit.name)}
                  />
                ))}
              </Group>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      {children}
    </View>
  );
}

function KitRow({
  kit,
  query,
  on,
  tint,
  onPress,
}: {
  kit: Kit;
  /** Search text to pick out in the name. */
  query?: string;
  on: boolean;
  tint: Tint;
  onPress: () => void;
}) {
  const at = query ? kit.name.toLowerCase().indexOf(query.toLowerCase()) : -1;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={kit.name}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={styles.row}>
      <KitWell kit={kit} size={36} />
      <Text style={styles.rowLabel}>
        {at < 0 || !query ? (
          kit.name
        ) : (
          <>
            {kit.name.slice(0, at)}
            <Text style={{ color: tint.ink }}>{kit.name.slice(at, at + query.length)}</Text>
            {kit.name.slice(at + query.length)}
          </>
        )}
      </Text>
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

/** Adds what was typed: the main thing to do when nothing matches, a quiet extra when something does. */
function AddOwn({
  name,
  quiet,
  tint,
  onPress,
}: {
  name: string;
  quiet: boolean;
  tint: Tint;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.addOwn,
        quiet
          ? styles.addOwnQuiet
          : { borderColor: tint.ink, borderBottomColor: tint.shade, backgroundColor: tint.wash },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.addIcon, { backgroundColor: quiet ? colors.surfaceMuted : tint.ink }]}>
        <PlusIcon color={quiet ? colors.textMuted : colors.onPrimary} size={18} />
      </View>
      <Text style={[styles.addLabel, { color: quiet ? colors.textMuted : tint.shade }]}>
        {quiet ? `Not it? Add “${name}” as your own` : `Add “${name}”`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  well: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: fonts.headingHeavy,
    fontSize: 17,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  clear: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.textFaint,
  },
  done: {
    minHeight: 44,
    justifyContent: 'center',
  },
  doneLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 20,
  },
  group: {
    paddingTop: 14,
  },
  groupLabel: {
    marginBottom: 2,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingLeft: 5,
    paddingRight: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  chipLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14,
  },
  chipX: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
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
  addOwn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    marginTop: 12,
    paddingLeft: 9,
    paddingRight: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  addOwnQuiet: {
    borderStyle: 'dashed',
    borderBottomWidth: 2,
    borderColor: colors.border,
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
