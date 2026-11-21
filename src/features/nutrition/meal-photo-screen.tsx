import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/theme';
import { FoodEditor } from './food-editor';
import { forRow, prepareMeal, summary, type FoodRow } from './nutrition';
import { NutrientValues } from './nutrient-values';
import { groupDetections, localEndpoint, recognizeFood } from './recognition';
import { saveMeal, SERVER_KEY } from './storage';
import { styles as s } from './styles';

type Photo = { uri: string; base64: string; ratio: number };
export default function MealPhotoScreen() {
  const { manual } = useLocalSearchParams<{ manual?: string }>();
  const blank = (): FoodRow => ({ id: `manual-${Date.now()}-${++sequence.current}`, name: '', grams: '', boxes: [], score: null, source: 'manual' });
  const [settings, setSettings] = useState(false);
  const [editor, setEditor] = useState<FoodRow | null>(() => manual === '1' ? { id: 'manual-first', name: '', grams: '', boxes: [], score: null, source: 'manual' } : null);
  const [review, setReview] = useState(manual === '1');
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
  function addFood() {
    setEditor(blank()); setError('');
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
      if (!mounted.current) return;
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, allowsEditing: false, base64: true };
      const result = library ? await ImagePicker.launchImageLibraryAsync(options) : await ImagePicker.launchCameraAsync(options);
      if (!result.canceled && mounted.current) {
        const asset = result.assets[0];
        if (!asset?.base64 || !asset.width || !asset.height) throw new Error('Unable to read this photo. Choose another image.');
        if (asset.base64.length > 11 * 1024 * 1024) throw new Error('Photo too large. Choose a smaller image.');
        setPhoto({ uri: asset.uri, base64: asset.base64, ratio: asset.width / asset.height });
        setRows([]); setAnalyzed(false); setSaved(false); setReview(false);
      }
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Unable to open the camera or library.'); }
    finally { lock.current = false; if (mounted.current) setBusy(null); }
  }
  async function analyze() {
    if (lock.current || !photo) return;
    const endpoint = localEndpoint(url);
    if (!endpoint) { setSettings(true); setError('Enter the current local address shown by the server, such as http://192.168.1.10:8765.'); return; }
    if (!token.trim()) { setSettings(true); setError('Enter the pairing code shown by the Python server.'); return; }
    lock.current = true; setBusy('analysis'); setError('');
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort(), 180000);
    try {
      const result = await recognizeFood(endpoint, token.trim(), photo.base64, abort.signal);
      if (!mounted.current) return;
      setRows(groupDetections(result.detections));
      setPhoto({ ...photo, ratio: result.imageWidth / result.imageHeight });
      setAnalyzed(true); setSaved(false); setReview(true);
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
    const leave = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/food'); };
    if (rows.length && !saved) {
      Alert.alert('Leave this meal?', 'Your unsaved changes will be lost.', [
        { text: 'Keep editing', style: 'cancel' }, { text: 'Leave', style: 'destructive', onPress: leave },
      ]);
    } else leave();
  }
  // Open native UI after the route mounts. Cancel the scheduled launch on unmount.
  useEffect(() => {
    if (manual === '1') return;
    const launch = setTimeout(() => { void capture(); }, 0);
    return () => clearTimeout(launch);
    // Capture uses the initial empty draft; later state changes must not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const editingExisting = !!editor && rows.some(row => row.id === editor.id);
  return <SafeAreaView style={s.root}>
    <View style={s.toolbar}>
      <Pressable accessibilityRole="button" style={s.link} disabled={!!busy} onPress={back}><Text style={s.linkText}>Back</Text></Pressable>
      <Text style={s.subtitle}>{saved ? 'Meal saved' : review ? 'Review meal' : 'Scan meal'}</Text>
      {!review ? <Pressable accessibilityRole="button" accessibilityLabel="Recognition settings" style={s.link} disabled={!!busy} onPress={() => setSettings(true)}><Text style={s.linkText}>Setup</Text></Pressable> : <View style={{ width: 48 }} />}
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content, { flexGrow: 1 }]}>
      {!review && <>
        {photo ? <View style={[s.photo, { aspectRatio: Math.max(photo.ratio, .8) }]}>
          <Image accessibilityLabel="Your meal photo" source={{ uri: photo.uri }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        </View> : <View style={[s.empty, { flex: 1 }]}><View style={s.plate}><Text style={[s.title, { fontSize: 44 }]}>＋</Text></View><Text style={s.subtitle}>What’s on your plate?</Text><Text style={s.muted}>Fit your meal in the frame.</Text></View>}
        {!busy && <>
          <Button title={photo ? 'Analyze foods' : 'Take photo'} onPress={() => { if (photo) replaceDraft(() => { void analyze(); }); else void capture(); }} />
          <View style={[s.amountRow, { justifyContent: 'center' }]}>
            {photo && <Pressable accessibilityRole="button" style={s.link} onPress={() => replaceDraft(() => { void capture(); })}><Text style={s.linkText}>Retake</Text></Pressable>}
            <Pressable accessibilityRole="button" style={s.link} onPress={() => replaceDraft(() => { void capture(true); })}><Text style={s.linkText}>Choose from library</Text></Pressable>
          </View>
          {!!rows.length && <Pressable accessibilityRole="button" style={s.link} onPress={() => setReview(true)}><Text style={[s.linkText, s.center]}>Back to meal</Text></Pressable>}
          <Pressable accessibilityRole="button" style={s.link} onPress={() => { setReview(true); addFood(); }}><Text style={[s.linkText, s.center]}>Add manually</Text></Pressable>
        </>}
      </>}
      {busy && <ActivityIndicator color={colors.primary} />}
      {busy === 'analysis' && <><Text style={[s.muted, s.center]}>Looking for foods… This may take a few minutes.</Text><Pressable accessibilityRole="button" style={s.link} onPress={() => controller.current?.abort()}><Text style={[s.linkText, s.center]}>Cancel analysis</Text></Pressable></>}
      {!!error && !settings && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {review && <>
        {photo && <View style={[s.photo, { aspectRatio: photo.ratio }]}>
          <Image accessibilityLabel="Your meal photo" source={{ uri: photo.uri }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
          {analyzed && rows.flatMap((row, i) => row.boxes.map((box, j) => <View key={`${row.id}-${j}`} pointerEvents="none" style={{
            position: 'absolute', left: `${box[0] * 100}%`, top: `${box[1] * 100}%`,
            width: `${(box[2] - box[0]) * 100}%`, height: `${(box[3] - box[1]) * 100}%`, borderWidth: 2, borderColor: colors.primary,
          }}><Text style={{ backgroundColor: colors.primary, color: colors.onPrimary, alignSelf: 'flex-start' }}>{i + 1}</Text></View>))}
        </View>}
        {!rows.length && <View style={s.empty}><Text style={s.subtitle}>{analyzed ? 'No foods found' : 'Build your meal'}</Text><Text style={s.muted}>{analyzed ? 'Try another photo or add a food below.' : 'Search for your first food to get started.'}</Text></View>}
        {rows.map((row, i) => {
          const result = forRow(row);
          return <Pressable key={row.id} accessibilityRole="button" accessibilityLabel={`Edit ${row.name}`} style={s.foodItem} disabled={!!busy || saved} onPress={() => setEditor(row)}>
            <Text style={s.linkText}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 4 }}><Text style={s.text}>{row.name}</Text><Text style={result ? s.muted : s.error}>{result ? `${result.grams} g · ${Math.round(result.values.calories)} kcal` : 'Choose food & quantity'}</Text></View>
            {!saved && <Text style={s.linkText}>Edit</Text>}
          </Pressable>;
        })}
        {!saved && <Pressable accessibilityRole="button" accessibilityState={{ disabled: rows.length >= 20 || !!busy }} disabled={rows.length >= 20 || !!busy} style={s.link} onPress={addFood}><Text style={s.linkText}>＋ Add food</Text></Pressable>}
        {photo && !saved && <Pressable accessibilityRole="button" style={s.link} disabled={!!busy} onPress={() => setReview(false)}><Text style={s.linkText}>Change photo</Text></Pressable>}
      </>}
    </ScrollView>
    {review && rows.length > 0 && <View style={s.footer}>
      <Text style={s.muted}>{totals.complete ? 'Estimated nutrition' : `${rows.length - totals.calculated} food(s) need a quantity or profile`}</Text>
      <NutrientValues values={totals.total} compact />
      <Button title={saved ? 'View saved meals' : 'Save meal'} disabled={!!busy || (!saved && !totals.complete)} onPress={saved ? back : () => { void save(); }} />
    </View>}
    {editor && <FoodEditor key={editor.id} initial={editor} onClose={() => setEditor(null)}
      onSave={row => { setRows(previous => editingExisting ? previous.map(item => item.id === row.id ? row : item) : [...previous, row]); setEditor(null); setSaved(false); setError(''); }}
      onRemove={editingExisting ? () => { setRows(previous => previous.filter(row => row.id !== editor.id)); setEditor(null); setSaved(false); } : undefined} />}
    <Modal visible={settings} animationType="slide" onRequestClose={() => setSettings(false)}>
      <SafeAreaView style={s.root}><KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.toolbar}><Text style={s.subtitle}>Recognition setup</Text><Pressable accessibilityRole="button" style={s.link} onPress={() => setSettings(false)}><Text style={s.linkText}>Done</Text></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
          <Text style={s.text}>Start the server on your computer. Connect both devices to the same trusted network.</Text>
          <Text style={s.muted}>Server address</Text>
          <TextInput style={s.input} accessibilityLabel="Recognition server address" placeholder="http://192.168.1.10:8765" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} value={url} onChangeText={setUrl} />
          <Text style={s.muted}>Pairing code</Text>
          <TextInput style={s.input} accessibilityLabel="Server pairing code" placeholder="Code from the server window" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} secureTextEntry value={token} onChangeText={setToken} />
          <Text style={s.muted}>Analyze sends your photo to this computer over local HTTP. Photos aren’t saved. Suggestions can be wrong; quantities are entered by you.</Text>
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView></SafeAreaView>
    </Modal>
  </SafeAreaView>;
}
