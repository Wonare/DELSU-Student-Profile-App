import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ searching }) {
  return (
    <View style={styles.container}>
      <Ionicons name="school-outline" size={42} color="#8aa39b" />
      <Text style={styles.title}>
        {searching ? 'No matching students' : 'No student records yet'}
      </Text>
      <Text style={styles.subtitle}>
        {searching
          ? 'Try another name, matric number, department, or contact detail.'
          : 'Tap Add Student to create the first DELSU student profile.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 56
  },
  title: {
    color: '#173f35',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center'
  },
  subtitle: {
    color: '#637a73',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center'
  }
});
