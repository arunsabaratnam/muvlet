import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors } from '@/constants/theme';
import type { Meal } from './nutrition';
import { NutrientValues } from './nutrient-values';
import { loadMeals } from './storage';
import { styles as s } from './styles';

export default function FoodScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError('');
    loadMeals().then(value => { if (active) setMeals(value); })
      .catch(() => { if (active) setError('Unable to load meal history. Try opening Food again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.root}>
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.title}>Food</Text>
      <Text style={s.text}>Take a photo of your meal, check the foods and quantities, and save its estimated nutrition.</Text>
      <Card style={s.card}>
        <Text style={s.subtitle}>What’s on your plate?</Text>
        <Text style={s.muted}>Use a clear photo with good lighting. You can correct every suggestion.</Text>
        <Button title="Take a photo of a meal" onPress={() => router.push('/meal-photo')} />
        <Button title="Add a meal manually" variant="secondary" onPress={() => router.push({ pathname: '/meal-photo', params: { manual: '1' } })} />
      </Card>
      <Text style={s.muted}>Recognition uses your computer. Quantities are entered by you or selected from reference portions; they are not measured from the photo.</Text>
      <Text style={s.subtitle}>Meal history</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : meals.length === 0 ?
        <Text style={s.muted}>Your saved meals will appear here.</Text> : meals.map(meal => <Card key={meal.id} style={s.card}>
          <Text style={s.text}>{new Date(meal.createdAt).toLocaleString()}</Text>
          <Text style={s.muted}>{meal.foods.map(food => `${food.name} · ${food.grams} g`).join('\n')}</Text>
          <NutrientValues values={meal.nutrition} />
          <Text style={s.muted}>Estimated from confirmed foods and quantities.</Text>
        </Card>)}
    </ScrollView>
  </SafeAreaView>;
}
