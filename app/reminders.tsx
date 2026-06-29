import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Bell, Trash2, Plus, Clock, CalendarClock } from 'lucide-react-native';

interface ScheduledReminder {
  id: string;
  hour: number;
  minute: number;
}

const PRESETS = [
  { label: 'Morning Workout', hour: 7, minute: 0 },
  { label: 'Lunch Session', hour: 12, minute: 30 },
  { label: 'Evening Gym', hour: 18, minute: 0 },
  { label: 'Night Stretch', hour: 21, minute: 0 },
];

function fmt(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minute.toString().padStart(2, '0')} ${period}`;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  const refresh = useCallback(async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const mapped: ScheduledReminder[] = scheduled
      .map((n) => {
        const trigger: any = n.trigger;
        if (trigger && typeof trigger.hour === 'number') {
          return { id: n.identifier, hour: trigger.hour, minute: trigger.minute ?? 0 };
        }
        return null;
      })
      .filter(Boolean) as ScheduledReminder[];
    setReminders(mapped.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ensurePermission = async (): Promise<boolean> => {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) {
      Alert.alert(
        'Notifications Disabled',
        'Enable notifications in Settings to receive workout reminders.'
      );
      return false;
    }
    return true;
  };

  const addReminder = async (label: string, hour: number, minute: number) => {
    if (!(await ensurePermission())) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ Smarty Gym',
        body: `Time for your ${label.toLowerCase()}! Let's go.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    refresh();
  };

  const removeReminder = async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    refresh();
  };

  const onPickTime = (event: DateTimePickerEvent, date?: Date) => {
    // iOS shows an inline spinner that fires onChange on every scroll, so we only
    // stash the value and commit it via the "Add" button below. Android shows a
    // one-shot modal that fires 'set' (confirmed) or 'dismissed' (cancelled).
    if (Platform.OS === 'ios') {
      if (date) setTempTime(date);
      return;
    }
    setShowPicker(false);
    if (event.type === 'set' && date) {
      addReminder('Workout', date.getHours(), date.getMinutes());
    }
  };

  const confirmIosTime = () => {
    setShowPicker(false);
    addReminder('Workout', tempTime.getHours(), tempTime.getMinutes());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.subtitle}>
        Get a daily notification so you never skip a session.
      </Text>

      <Text style={styles.sectionLabel}>Add a reminder</Text>
      {PRESETS.map((p) => (
        <TouchableOpacity
          key={p.label}
          style={styles.presetRow}
          onPress={() => addReminder(p.label, p.hour, p.minute)}
        >
          <Clock size={20} color="#007AFF" />
          <View style={styles.presetText}>
            <Text style={styles.presetTitle}>{p.label}</Text>
            <Text style={styles.presetTime}>{fmt(p.hour, p.minute)} daily</Text>
          </View>
          <Plus size={22} color="#007AFF" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.presetRow} onPress={() => setShowPicker(true)}>
        <CalendarClock size={20} color="#007AFF" />
        <View style={styles.presetText}>
          <Text style={styles.presetTitle}>Custom time…</Text>
          <Text style={styles.presetTime}>Pick any time of day</Text>
        </View>
        <Plus size={22} color="#007AFF" />
      </TouchableOpacity>

      {showPicker && (
        <View style={Platform.OS === 'ios' ? styles.iosPickerCard : undefined}>
          <DateTimePicker
            value={tempTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickTime}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerActions}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.iosCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmIosTime}>
                <Text style={styles.iosAdd}>Add Reminder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionLabel}>Active reminders</Text>
      {reminders.length === 0 ? (
        <Text style={styles.empty}>No reminders yet. Add one above.</Text>
      ) : (
        reminders.map((r) => (
          <View key={r.id} style={styles.activeRow}>
            <Bell size={20} color="#34c759" />
            <Text style={styles.activeTime}>{fmt(r.hour, r.minute)} daily</Text>
            <TouchableOpacity onPress={() => removeReminder(r.id)} hitSlop={10}>
              <Trash2 size={20} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  scroll: { padding: 20 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 8, lineHeight: 21 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  presetText: { flex: 1 },
  presetTitle: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  presetTime: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  activeTime: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  empty: { fontSize: 15, color: '#8e8e93', fontStyle: 'italic', paddingVertical: 8 },
  iosPickerCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, paddingBottom: 8 },
  iosPickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  iosCancel: { fontSize: 16, color: '#8e8e93', fontWeight: '600' },
  iosAdd: { fontSize: 16, color: '#007AFF', fontWeight: '700' },
});
