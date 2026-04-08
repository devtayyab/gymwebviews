import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleNumberPress = (num: string) => {
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperationPress = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculateResult(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setShouldResetDisplay(true);
  };

  const calculateResult = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return prev / current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
      const result = calculateResult(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setShouldResetDisplay(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  };

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleNegative = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const Button = ({
    text,
    onPress,
    variant = 'number'
  }: {
    text: string;
    onPress: () => void;
    variant?: 'number' | 'operator' | 'clear' | 'equals'
  }) => (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'operator' && styles.operatorButton,
        variant === 'clear' && styles.clearButton,
        variant === 'equals' && styles.equalsButton,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'operator' && styles.operatorText,
          variant === 'clear' && styles.clearText,
          variant === 'equals' && styles.equalsText,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <Button text="C" onPress={handleClear} variant="clear" />
          <Button text="+/-" onPress={handleNegative} variant="operator" />
          <Button text="÷" onPress={() => handleOperationPress('÷')} variant="operator" />
        </View>

        <View style={styles.row}>
          <Button text="7" onPress={() => handleNumberPress('7')} />
          <Button text="8" onPress={() => handleNumberPress('8')} />
          <Button text="9" onPress={() => handleNumberPress('9')} />
          <Button text="×" onPress={() => handleOperationPress('×')} variant="operator" />
        </View>

        <View style={styles.row}>
          <Button text="4" onPress={() => handleNumberPress('4')} />
          <Button text="5" onPress={() => handleNumberPress('5')} />
          <Button text="6" onPress={() => handleNumberPress('6')} />
          <Button text="-" onPress={() => handleOperationPress('-')} variant="operator" />
        </View>

        <View style={styles.row}>
          <Button text="1" onPress={() => handleNumberPress('1')} />
          <Button text="2" onPress={() => handleNumberPress('2')} />
          <Button text="3" onPress={() => handleNumberPress('3')} />
          <Button text="+" onPress={() => handleOperationPress('+')} variant="operator" />
        </View>

        <View style={styles.row}>
          <Button text="0" onPress={() => handleNumberPress('0')} />
          <Button text="." onPress={handleDecimal} />
          <Button text="=" onPress={handleEquals} variant="equals" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  displayText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '300',
  },
  buttonContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#333',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  operatorButton: {
    backgroundColor: '#ff9500',
  },
  clearButton: {
    backgroundColor: '#a5a5a5',
  },
  equalsButton: {
    backgroundColor: '#ff9500',
    flex: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  operatorText: {
    fontSize: 40,
  },
  clearText: {
    color: '#000',
    fontWeight: '600',
  },
  equalsText: {
    fontSize: 40,
  },
});
