import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/theme';
import { FoodNutrition } from './food-nutrition';
import { foods, forRow, type FoodRow } from './nutrition';
import { styles as s } from './styles';

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe');
export function FoodEditor({ initial, onSave, onClose, onRemove }: {
  initial: FoodRow; onSave: (row: FoodRow) => void; onClose: () => void; onRemove?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [search, setSearch] = useState(!initial.foodId);
  const [query, setQuery] = useState(initial.name);
  const matches = foods.filter(food => normalize(`${food.displayLabel} ${food.label} ${food.usdaDescription} ${food.group}`).includes(normalize(query)));
  const valid = draft.name.trim() && forRow(draft);
  function choose(foodId: string, name: string) {
    setDraft({ ...draft, foodId, name, grams: '', custom: {}, quantitySource: 'user', portionDescription: null });
    setSearch(false);
  }
  return <Modal animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.toolbar}>
          <Pressable accessibilityRole="button" accessibilityLabel={search ? 'Cancel food editing' : 'Back to food search'} style={s.link} onPress={search ? onClose : () => setSearch(true)}><Text style={s.linkText}>{search ? 'Cancel' : 'Back'}</Text></Pressable>
          <Text style={s.subtitle}>{search ? 'Add food' : 'Quantity'}</Text><View style={{ width: 48 }} />
        </View>
        {search ? <>
          <View style={s.searchArea}><TextInput style={s.input} accessibilityLabel="Search foods" placeholder="Search foods" placeholderTextColor={colors.textMuted} value={query} onChangeText={setQuery} autoCorrect={false} />
            <Text style={s.muted}>Choose the food and preparation.</Text></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.searchArea}>
            {matches.map(food => <Pressable key={food.id} accessibilityRole="button" accessibilityLabel={food.displayLabel} style={s.foodItem} onPress={() => choose(food.id, food.displayLabel)}>
              <View style={{ flex: 1, gap: 4 }}><Text style={s.text}>{food.displayLabel}</Text><Text style={s.muted}>{food.per100g.calories} kcal / 100 g</Text></View><Text style={s.linkText}>＋</Text>
            </Pressable>)}
            {!matches.length && <Text style={s.muted}>No matching nutrition profile. Try another name or enter the label values.</Text>}
          </ScrollView>
          <View style={s.footer}><Pressable accessibilityRole="button" style={s.link} onPress={() => choose('custom', query.trim())}><Text style={[s.linkText, s.center]}>Enter label values</Text></Pressable>{onRemove && <Pressable accessibilityRole="button" style={s.link} onPress={onRemove}><Text style={[s.linkText, s.center, { color: colors.danger }]}>Remove food</Text></Pressable>}</View>
        </> : <>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
            {draft.foodId === 'custom' ? <TextInput style={s.input} accessibilityLabel="Food name" placeholder="Food name" value={draft.name} onChangeText={name => setDraft({ ...draft, name })} /> : <Text style={s.subtitle}>{draft.name}</Text>}
            <FoodNutrition row={draft} disabled={false} onChange={patch => setDraft({ ...draft, ...patch })} />
            {onRemove && <Pressable accessibilityRole="button" style={s.link} onPress={onRemove}><Text style={[s.linkText, { color: colors.danger }]}>Remove food</Text></Pressable>}
          </ScrollView>
          <View style={s.footer}><Button title={onRemove ? 'Save changes' : 'Add to meal'} disabled={!valid} onPress={() => onSave(draft)} /></View>
        </>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
