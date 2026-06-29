import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from 'expo-router';
import { Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react-native';

type Phase = 'idle' | 'work' | 'rest' | 'done';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function impact(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
}

export default function TimerScreen() {
  const [workSec, setWorkSec] = useState(30);
  const [restSec, setRestSec] = useState(15);
  const [rounds, setRounds] = useState(8);

  const [phase, setPhase] = useState<Phase>('idle');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(30);
  const [round, setRound] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Latest values for the interval callback to read without re-subscribing.
  const phaseRef = useRef<Phase>(phase);
  const remainingRef = useRef(remaining);
  const roundRef = useRef(round);
  const cfgRef = useRef({ workSec, restSec, rounds });
  phaseRef.current = phase;
  remainingRef.current = remaining;
  roundRef.current = round;
  cfgRef.current = { workSec, restSec, rounds };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopAwake = () => deactivateKeepAwake().catch(() => {});

  // Stop everything when leaving the screen.
  useFocusEffect(
    useCallback(() => {
      return () => {
        clearTimer();
        stopAwake();
      };
    }, [])
  );

  // Keep the idle countdown display in sync with the configured work time.
  useEffect(() => {
    if (phase === 'idle') setRemaining(workSec);
  }, [workSec, phase]);

  const tick = () => {
    const { workSec: w, restSec: rst, rounds: total } = cfgRef.current;

    if (remainingRef.current > 1) {
      if (remainingRef.current <= 4) impact(Haptics.ImpactFeedbackStyle.Light);
      setRemaining((v) => v - 1);
      return;
    }

    // Phase boundary.
    if (phaseRef.current === 'work') {
      if (roundRef.current >= total) {
        clearTimer();
        setRunning(false);
        setPhase('done');
        setRemaining(0);
        stopAwake();
        impact(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        setPhase('rest');
        setRemaining(rst);
        impact(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else if (phaseRef.current === 'rest') {
      setRound((r) => r + 1);
      setPhase('work');
      setRemaining(w);
      impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(tick, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const start = () => {
    if (phase === 'idle' || phase === 'done') {
      setPhase('work');
      setRound(1);
      setRemaining(workSec);
      impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setRunning(true);
    activateKeepAwakeAsync().catch(() => {});
  };

  const pause = () => {
    setRunning(false);
    clearTimer();
    stopAwake();
  };

  const reset = () => {
    clearTimer();
    setRunning(false);
    setPhase('idle');
    setRound(1);
    setRemaining(workSec);
    stopAwake();
  };

  const isActive = phase === 'work' || phase === 'rest';
  const accent = phase === 'rest' ? '#34c759' : phase === 'done' ? '#007AFF' : '#ff3b30';

  const Stepper = ({
    label,
    value,
    onChange,
    step,
    suffix,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    step: number;
    suffix?: string;
  }) => (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.max(step, value - step))}
        >
          <Minus size={18} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>
          {value}
          {suffix}
        </Text>
        <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(value + step)}>
          <Plus size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.display, { backgroundColor: accent }]}>
        <Text style={styles.phaseText}>
          {phase === 'idle'
            ? 'READY'
            : phase === 'work'
            ? 'WORK'
            : phase === 'rest'
            ? 'REST'
            : 'DONE 💪'}
        </Text>
        <Text style={styles.time}>{fmt(remaining)}</Text>
        {isActive && (
          <Text style={styles.roundText}>
            Round {round} / {rounds}
          </Text>
        )}
      </View>

      {phase === 'idle' && (
        <View style={styles.config}>
          <Stepper label="Work" value={workSec} onChange={setWorkSec} step={5} suffix="s" />
          <Stepper label="Rest" value={restSec} onChange={setRestSec} step={5} suffix="s" />
          <Stepper label="Rounds" value={rounds} onChange={setRounds} step={1} />
        </View>
      )}

      <View style={styles.controls}>
        {!running ? (
          <TouchableOpacity style={[styles.controlBtn, styles.primary]} onPress={start}>
            <Play size={26} color="#fff" fill="#fff" />
            <Text style={styles.controlText}>
              {phase === 'idle' || phase === 'done' ? 'Start' : 'Resume'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.controlBtn, styles.secondary]} onPress={pause}>
            <Pause size={26} color="#fff" fill="#fff" />
            <Text style={styles.controlText}>Pause</Text>
          </TouchableOpacity>
        )}
        {phase !== 'idle' && (
          <TouchableOpacity style={[styles.controlBtn, styles.reset]} onPress={reset}>
            <RotateCcw size={24} color="#1c1c1e" />
            <Text style={[styles.controlText, { color: '#1c1c1e' }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  display: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  phaseText: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  time: { color: '#fff', fontSize: 72, fontWeight: '800', fontVariant: ['tabular-nums'] },
  roundText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
  config: { padding: 20, gap: 12 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stepperLabel: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 18, fontWeight: '700', color: '#1c1c1e', minWidth: 52, textAlign: 'center' },
  controls: { flexDirection: 'row', gap: 12, padding: 20, marginTop: 'auto' },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primary: { backgroundColor: '#007AFF' },
  secondary: { backgroundColor: '#ff9500' },
  reset: { backgroundColor: '#e5e5ea' },
  controlText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
