import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors } from '@/constants/theme';
import { FoodNutrition } from './food-nutrition';
import { prepareMeal, summary, type FoodRow } from './nutrition';
import { NutrientValues } from './nutrient-values';
import { groupDetections, localEndpoint, recognizeFood } from './recognition';
import { saveMeal, SERVER_KEY } from './storage';
import { styles as s } from './styles';

type Photo = { uri: string; base64: string; ratio: number };
export default function MealPhotoScreen() {
  const { manual } = useLocalSearchParams<{ manual?: string }>();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [rows, setRows] = useState<FoodRow[]>([]);
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState<'capture' | 'analysis' | 'save' | null>(null);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [saved, setSaved] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const totals = summary(rows);
  useEffect(() => {
    mounted.current = true;
    AsyncStorage.getItem(SERVER_KEY).then(value => { if (mounted.current && value) setUrl(value); }).catch(() => {});
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);
  function edit(id: string, patch: Partial<FoodRow>) {
    setRows(previous => previous.map(row => row.id === id ? { ...row, ...patch, confirmed: patch.confirmed ?? false } : row));
    setSaved(false); setError('');
  }
  function addFood() {
    setRows(previous => [...previous, { id: `manual-${++sequence.current}`, name: '', grams: '', boxes: [], score: null, source: 'manual', confirmed: false }]);
    setSaved(false); setError('');
  }
  function replaceDraft(action: () => void) {
    if (!rows.length || saved) { action(); return; }
    Alert.alert('Replace these foods?', 'This will replace your current food and quantity entries.', [
      { text: 'Keep editing', style: 'cancel' }, { text: 'Replace', style: 'destructive', onPress: action },
    ]);
  }
  async function capture(library = false) {
    if (lock.current) return;
    lock.current = true; setBusy('capture'); setError('');
    try {
      if (!library) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera access', 'Allow camera access to take a meal photo, or choose an image from your library.', [
            { text: 'Cancel', style: 'cancel' }, { text: 'Open settings', onPress: () => { void Linking.openSettings(); } },
          ]);
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, allowsEditing: false, base64: true };
      const result = library ? await ImagePicker.launchImageLibraryAsync(options) : await ImagePicker.launchCameraAsync(options);
      if (!result.canceled && mounted.current) {
        const asset = result.assets[0];
        if (!asset?.base64 || !asset.width || !asset.height) throw new Error('Unable to read this photo. Choose another image.');
        if (asset.base64.length > 11 * 1024 * 1024) throw new Error('Photo too large. Choose a smaller image.');
        setPhoto({ uri: asset.uri, base64: asset.base64, ratio: asset.width / asset.height });
        setRows([]); setAnalyzed(false); setSaved(false);
      }
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Unable to open the camera or library.'); }
    finally { lock.current = false; if (mounted.current) setBusy(null); }
  }
  async function analyze() {
    if (lock.current || !photo) return;
    const endpoint = localEndpoint(url);
    if (!endpoint) { setError('Enter the current local address shown by the server, such as http://192.168.1.10:8765.'); return; }
    if (!token.trim()) { setError('Enter the pairing code shown by the Python server.'); return; }
    lock.current = true; setBusy('analysis'); setError('');
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort(), 180000);
    try {
      const result = await recognizeFood(endpoint, token.trim(), photo.base64, abort.signal);
      if (!mounted.current) return;
      setRows(groupDetections(result.detections));
      setPhoto({ ...photo, ratio: result.imageWidth / result.imageHeight });
      setAnalyzed(true); setSaved(false);
      void AsyncStorage.setItem(SERVER_KEY, endpoint).catch(() => {});
    } catch (e) {
      if (mounted.current) setError(e instanceof Error && e.name === 'AbortError'
        ? 'Analysis canceled or timed out. You can retry or add foods manually.'
        : e instanceof Error && e.message !== 'Network request failed' ? e.message
        : 'Cannot reach the server. Check the computer address, pairing code, local-network permission and Wi-Fi.');
    } finally { clearTimeout(timer); controller.current = null; lock.current = false; if (mounted.current) setBusy(null); }
  }
  async function save() {
    if (lock.current || saved) return;
    try {
      const mealFoods = prepareMeal(rows);
      const nutrition = summary(rows).total;
      if (!nutrition) return;
      lock.current = true; setBusy('save'); setError('');
      await saveMeal({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), foods: mealFoods, nutrition });
      if (mounted.current) setSaved(true);
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Unable to save this meal.'); }
    finally { lock.current = false; if (mounted.current) setBusy(null); }
  }
  function back() {
    if (router.canGoBack()) router.back(); else router.replace('/(tabs)/food');
  }
  return <SafeAreaView style={s.root}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
        <Button title={saved ? 'View saved meals' : 'Back to Food'} variant="secondary" disabled={busy === 'save'} onPress={back} />
        <Text style={s.title}>{manual === '1' ? 'Add a meal' : 'Take a photo of your meal'}</Text>
        <Text style={s.muted}>Confirm the foods, choose a nutrition profile and adjust the quantities before saving.</Text>
        <Button title={photo ? 'Retake photo' : 'Take photo'} disabled={!!busy} onPress={() => replaceDraft(() => { void capture(); })} />
        <Button title="Choose from library" variant="secondary" disabled={!!busy} onPress={() => replaceDraft(() => { void capture(true); })} />
        {photo && <>
          <View style={[s.photo, { aspectRatio: photo.ratio }]}>
            <Image accessibilityLabel="Your meal photo" source={{ uri: photo.uri }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
            {analyzed && rows.flatMap((row, i) => row.boxes.map((box, j) => <View key={`${row.id}-${j}`} pointerEvents="none" style={{
              position: 'absolute', left: `${box[0] * 100}%`, top: `${box[1] * 100}%`,
              width: `${(box[2] - box[0]) * 100}%`, height: `${(box[3] - box[1]) * 100}%`,
              borderWidth: 2, borderColor: colors.primary,
            }}><Text style={{ backgroundColor: colors.primary, color: colors.onPrimary, alignSelf: 'flex-start' }}>{i + 1}</Text></View>))}
          </View>
          <Card style={s.card}>
            <Text style={s.subtitle}>Connect to your computer</Text>
            <Text style={s.muted}>Start the meal-recognition server and enter its address and code. Use a trusted local network shared by both devices.</Text>
            <TextInput style={s.input} accessibilityLabel="Recognition server address" placeholder="http://192.168.1.10:8765" placeholderTextColor={colors.textMuted}
              autoCapitalize="none" autoCorrect={false} editable={!busy} value={url} onChangeText={setUrl} />
            <TextInput style={s.input} accessibilityLabel="Server pairing code" placeholder="Pairing code" placeholderTextColor={colors.textMuted}
              autoCapitalize="none" autoCorrect={false} secureTextEntry editable={!busy} value={token} onChangeText={setToken} />
            <Text style={s.muted}>Analyze sends this photo to your computer over local HTTP. The server does not save it. Recognition can miss foods and does not measure quantities.</Text>
            <Button title={analyzed ? 'Analyze again' : 'Analyze foods'} disabled={!!busy} onPress={() => replaceDraft(() => { void analyze(); })} />
          </Card>
        </>}
        {busy && <ActivityIndicator color={colors.primary} />}
        {busy === 'analysis' && <><Text style={s.muted}>Analyzing on your computer. This may take a few minutes.</Text><Button title="Cancel analysis" variant="secondary" onPress={() => controller.current?.abort()} /></>}
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        {analyzed && rows.length === 0 && <Text style={s.muted}>No confident food suggestions. Try another photo or add foods manually.</Text>}
        {rows.map((row, i) => <Card key={row.id} style={s.card}>
          <Text style={s.subtitle}>Food {i + 1}</Text>
          {row.score !== null && <Text style={s.muted}>Model score: {Math.round(row.score * 100)}%. Please verify.</Text>}
          <TextInput style={s.input} accessibilityLabel={`Food ${i + 1} name`} value={row.name} editable={!busy} placeholder="Food name" placeholderTextColor={colors.textMuted}
            onChangeText={name => edit(row.id, { name, foodId: undefined, custom: {}, grams: '', quantitySource: 'user', portionDescription: null })} />
          <FoodNutrition row={row} disabled={!!busy} onChange={patch => edit(row.id, patch)} />
          <Pressable style={s.link} accessibilityRole="checkbox" accessibilityState={{ checked: row.confirmed, disabled: !!busy }} disabled={!!busy}
            onPress={() => edit(row.id, { confirmed: !row.confirmed })}>
            <Text style={s.linkText}>{row.confirmed ? '☑' : '☐'} I confirm this food, profile and quantity</Text>
          </Pressable>
          <Button title="Remove food" variant="secondary" disabled={!!busy} onPress={() => { setRows(previous => previous.filter(r => r.id !== row.id)); setSaved(false); }} />
        </Card>)}
        <Button title="Add a food manually" variant="secondary" disabled={!!busy || rows.length >= 20} onPress={addFood} />
        {rows.length > 0 && <Card style={s.card}>
          <Text style={s.subtitle}>{totals.complete ? 'Estimated meal total' : 'Incomplete subtotal'}</Text>
          <Text style={s.muted}>{totals.calculated} of {rows.length} foods calculated</Text>
          <NutrientValues values={totals.total} />
          <Text style={s.muted}>Values depend on your chosen profiles and quantities. Include oils and sauces if they are not already part of the selected preparation.</Text>
          <Button title={saved ? 'Meal saved' : 'Save meal'} disabled={!!busy || saved} onPress={() => { void save(); }} />
        </Card>}
        {saved && <Text accessibilityRole="alert" style={s.text}>Meal saved on this device. The photo is not kept in history.</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
