import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
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
      <Text style={s.muted}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
      {!loading && !error && meals.length === 0 && <View style={s.empty}>
        <View style={s.plate}><Text style={[s.title, { fontSize: 40 }]}>＋</Text></View>
        <Text style={s.subtitle}>No meals yet</Text><Text style={s.muted}>Add your first meal.</Text>
      </View>}
      <Button title="Scan meal" onPress={() => router.push('/meal-photo')} />
      <Pressable accessibilityRole="button" style={s.link} onPress={() => router.push({ pathname: '/meal-photo', params: { manual: '1' } })}><Text style={[s.linkText, s.center]}>Add manually</Text></Pressable>
      {!!meals.length && <Text style={s.subtitle}>Meal history</Text>}
      {loading ? <ActivityIndicator color={colors.primary} /> : error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : meals.length === 0 ?
        null : meals.map(meal => <Card key={meal.id} style={s.card}>
          <Text style={s.text}>{new Date(meal.createdAt).toLocaleString()}</Text>
          <Text style={s.muted}>{meal.foods.map(food => `${food.name} · ${food.grams} g`).join('\n')}</Text>
          <NutrientValues values={meal.nutrition} />

        </Card>)}
    </ScrollView>
  </SafeAreaView>;
}
