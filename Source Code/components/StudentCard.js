import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StudentCard({ student, onEdit, onDelete, onSharePdf }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.photoFrame}>
          {student.passportUri ? (
            <Image source={{ uri: student.passportUri }} style={styles.photo} />
          ) : (
            <Ionicons name="person-outline" size={34} color="#6f8c83" />
          )}
        </View>

        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={2}>
            {student.fullName}
          </Text>
          <Text style={styles.matric}>{student.matricNumber}</Text>
          <Text style={styles.department} numberOfLines={2}>
            {student.department}
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton
            color="#5bc0de"
            icon="share-social-outline"
            label={`Share ${student.fullName} as PDF`}
            onPress={() => onSharePdf(student)}
          />
          <IconButton
            color="#5bc0de"
            icon="create-outline"
            label={`Edit ${student.fullName}`}
            onPress={() => onEdit(student)}
          />
          <IconButton
            color="#b3261e"
            danger
            icon="trash-outline"
            label={`Delete ${student.fullName}`}
            onPress={() => onDelete(student)}
          />
        </View>
      </View>

      <InfoSection title="Personal Information">
        <Detail icon="calendar-outline" label="Date of Birth" value={student.dateOfBirth} />
        <Detail icon="male-female-outline" label="Gender" value={student.gender} />
      </InfoSection>

      <InfoSection title="Academic Information">
        <Detail icon="business-outline" label="Department" value={student.department} />
        <Detail icon="stats-chart-outline" label="Level" value={student.level} />
        <Detail icon="card-outline" label="Matric Number" value={student.matricNumber} />
      </InfoSection>

      <InfoSection title="Contact Information">
        <Detail icon="call-outline" label="Phone" value={student.phone} />
        <Detail icon="mail-outline" label="Email" value={student.email || 'Not provided'} />
        <Detail icon="location-outline" label="Address" value={student.address || 'Not provided'} />
      </InfoSection>
    </View>
  );
}

function IconButton({ color, danger, icon, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, danger && styles.deleteButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

function InfoSection({ children, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.detailsGrid}>{children}</View>
    </View>
  );
}

function Detail({ icon, label, value }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={15} color="#60766f" />
      <Text style={styles.detailText} numberOfLines={3}>
        <Text style={styles.detailLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6e1',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  photoFrame: {
    alignItems: 'center',
    backgroundColor: '#edf4f1',
    borderRadius: 8,
    height: 82,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 68
  },
  photo: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%'
  },
  identity: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: '#102f28',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22
  },
  matric: {
    color: '#5bc0de',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3
  },
  department: {
    color: '#627a72',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  actions: {
    gap: 7
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#e8f3ee',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34
  },
  deleteButton: {
    backgroundColor: '#fdecea'
  },
  section: {
    borderTopColor: '#edf2ef',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12
  },
  sectionTitle: {
    color: '#5bc0de',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 9
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  detail: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    width: '48%'
  },
  detailText: {
    color: '#304a42',
    flex: 1,
    fontSize: 12,
    lineHeight: 17
  },
  detailLabel: {
    color: '#657b74',
    fontWeight: '700'
  },
  pressed: {
    opacity: 0.72
  }
});
