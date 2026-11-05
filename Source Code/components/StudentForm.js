import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { departments, genders, levels } from '../constants';

const emptyStudent = {
  passportUri: '',
  fullName: '',
  matricNumber: '',
  department: '',
  dateOfBirth: '',
  level: '',
  gender: '',
  phone: '',
  email: '',
  address: ''
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const birthYears = Array.from({ length: new Date().getFullYear() - 1949 }, (_, index) => new Date().getFullYear() - index);

export default function StudentForm({ visible, student, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyStudent);
  const [departmentPickerVisible, setDepartmentPickerVisible] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const isEditing = useMemo(() => Boolean(student?.id), [student]);

  useEffect(() => {
    if (visible) {
      const nextForm = student ? { ...emptyStudent, ...student } : emptyStudent;
      setForm(nextForm);
      setDepartmentSearch('');
      setCalendarMonth(nextForm.dateOfBirth ? dateFromValue(nextForm.dateOfBirth) : new Date(2000, 0, 1));
    }
  }, [student, visible]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function pickPassport() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to select a passport photograph.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      updateField('passportUri', result.assets[0].uri);
    }
  }

  function validateAndSubmit() {
    const requiredFields = [
      ['fullName', 'Full name'],
      ['matricNumber', 'Matric number'],
      ['department', 'Department'],
      ['dateOfBirth', 'Date of birth'],
      ['level', 'Level'],
      ['gender', 'Gender'],
      ['phone', 'Phone number']
    ];

    const missingField = requiredFields.find(([field]) => !form[field].trim());

    if (missingField) {
      Alert.alert('Missing information', `${missingField[1]} is required.`);
      return;
    }

    if (!/^\d{11}$/.test(form.phone.trim())) {
      Alert.alert('Invalid phone number', 'Phone number must be exactly 11 digits.');
      return;
    }

    if (form.email.trim() && !form.email.trim().includes('@')) {
      Alert.alert('Invalid email address', 'Email address must contain "@".');
      return;
    }

    onSubmit(form);
  }

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close form"
            onPress={onClose}
            style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={24} color="#173f35" />
          </Pressable>
          <Text style={styles.title}>{isEditing ? 'Edit Student' : 'Add Student'}</Text>
          <Pressable
            accessibilityLabel="Save student profile"
            disabled={saving}
            onPress={validateAndSubmit}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, saving && styles.disabled]}
          >
            <Ionicons name="checkmark" size={22} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormSection title="Personal Information">
            <View style={styles.photoSection}>
              <Pressable
                accessibilityLabel="Choose passport photograph"
                onPress={pickPassport}
                style={({ pressed }) => [styles.passportPicker, pressed && styles.pressed]}
              >
                {form.passportUri ? (
                  <Image source={{ uri: form.passportUri }} style={styles.passportImage} />
                ) : (
                  <View style={styles.passportPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#5bc0de" />
                    <Text style={styles.passportText}>Passport Photo</Text>
                  </View>
                )}
              </Pressable>

              {form.passportUri ? (
                <Pressable
                  accessibilityLabel="Remove passport photograph"
                  onPress={() => updateField('passportUri', '')}
                  style={({ pressed }) => [styles.removePhotoButton, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={17} color="#b3261e" />
                  <Text style={styles.removePhotoText}>Remove photo</Text>
                </Pressable>
              ) : null}
            </View>

            <Input label="Full Name" value={form.fullName} onChangeText={(value) => updateField('fullName', value)} />
            <SelectField
              icon="calendar-outline"
              label="Date of Birth"
              onPress={() => setCalendarVisible(true)}
              placeholder="Choose from calendar"
              value={form.dateOfBirth}
            />
            <ChoiceGroup
              label="Gender"
              options={genders}
              selectedValue={form.gender}
              onSelect={(value) => updateField('gender', value)}
            />
          </FormSection>

          <FormSection title="Academic Information">
            <Input
              autoCapitalize="characters"
              label="Matric Number"
              value={form.matricNumber}
              onChangeText={(value) => updateField('matricNumber', value)}
            />
            <SelectField
              icon="chevron-down"
              label="Department"
              onPress={() => setDepartmentPickerVisible(true)}
              placeholder="Select department"
              value={form.department}
            />
            <ChoiceGroup
              label="Level"
              options={levels}
              selectedValue={form.level}
              onSelect={(value) => updateField('level', value)}
            />
          </FormSection>

          <FormSection title="Contact Information">
            <Input
              maxLength={11}
              keyboardType="phone-pad"
              label="Phone Number"
              value={form.phone}
              onChangeText={(value) => updateField('phone', value.replace(/\D/g, '').slice(0, 11))}
            />
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email Address"
              value={form.email}
              onChangeText={(value) => updateField('email', value)}
            />
            <Input
              label="Address"
              multiline
              value={form.address}
              onChangeText={(value) => updateField('address', value)}
            />
          </FormSection>
        </ScrollView>
      </KeyboardAvoidingView>

      <DepartmentPicker
        onClose={() => setDepartmentPickerVisible(false)}
        onSelect={(department) => {
          updateField('department', department);
          setDepartmentPickerVisible(false);
        }}
        search={departmentSearch}
        selectedValue={form.department}
        setSearch={setDepartmentSearch}
        visible={departmentPickerVisible}
      />

      <CalendarPicker
        month={calendarMonth}
        onChangeMonth={setCalendarMonth}
        onClose={() => setCalendarVisible(false)}
        onSelect={(value) => {
          updateField('dateOfBirth', value);
          setCalendarVisible(false);
        }}
        selectedValue={form.dateOfBirth}
        visible={calendarVisible}
      />
    </Modal>
  );
}

function FormSection({ children, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Input({ label, multiline, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#8ca39c"
        style={[styles.input, multiline && styles.multilineInput]}
        textAlignVertical={multiline ? 'top' : 'center'}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

function SelectField({ icon, label, onPress, placeholder, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={`Select ${label}`}
        onPress={onPress}
        style={({ pressed }) => [styles.selectField, pressed && styles.pressed]}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]} numberOfLines={2}>
          {value || placeholder}
        </Text>
        <Ionicons name={icon} size={19} color="#60766f" />
      </Pressable>
    </View>
  );
}

function ChoiceGroup({ label, options, selectedValue, onSelect }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map((option) => {
          const selected = selectedValue === option;

          return (
            <Pressable
              accessibilityLabel={`Select ${label} ${option}`}
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.choice,
                selected && styles.choiceSelected,
                pressed && styles.pressed
              ]}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DepartmentPicker({ onClose, onSelect, search, selectedValue, setSearch, visible }) {
  const filteredDepartments = departments.filter((department) =>
    department.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.pickerPanel}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Department</Text>
            <Pressable accessibilityLabel="Close department picker" onPress={onClose} style={styles.headerIcon}>
              <Ionicons name="close" size={22} color="#173f35" />
            </Pressable>
          </View>
          <View style={styles.pickerSearch}>
            <Ionicons name="search" size={18} color="#60766f" />
            <TextInput
              onChangeText={setSearch}
              placeholder="Search departments"
              placeholderTextColor="#8ca39c"
              style={styles.pickerSearchInput}
              value={search}
            />
          </View>
          <ScrollView style={styles.departmentList}>
            {filteredDepartments.map((department) => {
              const selected = selectedValue === department;

              return (
                <Pressable
                  key={department}
                  onPress={() => onSelect(department)}
                  style={({ pressed }) => [
                    styles.departmentOption,
                    selected && styles.departmentOptionSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={[styles.departmentOptionText, selected && styles.departmentOptionTextSelected]}>
                    {department}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={18} color="#5bc0de" /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CalendarPicker({ month, onChangeMonth, onClose, onSelect, selectedValue, visible }) {
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const days = buildCalendarDays(month);
  const currentMonth = month.getMonth();

  function moveMonth(offset) {
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  function moveYear(offset) {
    onChangeMonth(new Date(month.getFullYear() + offset, month.getMonth(), 1));
  }

  function selectYear(year) {
    onChangeMonth(new Date(year, month.getMonth(), 1));
    setYearPickerVisible(false);
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarPanel}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Date of Birth</Text>
            <Pressable accessibilityLabel="Close calendar" onPress={onClose} style={styles.headerIcon}>
              <Ionicons name="close" size={22} color="#173f35" />
            </Pressable>
          </View>

          <View style={styles.calendarNav}>
            <Pressable accessibilityLabel="Previous month" onPress={() => moveMonth(-1)} style={styles.calendarNavButton}>
              <Ionicons name="chevron-back" size={22} color="#5bc0de" />
            </Pressable>
            <Text style={styles.calendarMonth}>
              {monthNames[month.getMonth()]} {month.getFullYear()}
            </Text>
            <Pressable accessibilityLabel="Next month" onPress={() => moveMonth(1)} style={styles.calendarNavButton}>
              <Ionicons name="chevron-forward" size={22} color="#5bc0de" />
            </Pressable>
          </View>

          <View style={styles.yearNav}>
            <Pressable accessibilityLabel="Previous year" onPress={() => moveYear(-1)} style={styles.yearNavButton}>
              <Ionicons name="play-back" size={17} color="#5bc0de" />
              <Text style={styles.yearNavText}>Year</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Choose year of birth"
              onPress={() => setYearPickerVisible(true)}
              style={({ pressed }) => [styles.yearPickerButton, pressed && styles.pressed]}
            >
              <Text style={styles.yearPickerText}>{month.getFullYear()}</Text>
              <Ionicons name="chevron-down" size={16} color="#5bc0de" />
            </Pressable>
            <Pressable accessibilityLabel="Next year" onPress={() => moveYear(1)} style={styles.yearNavButton}>
              <Text style={styles.yearNavText}>Year</Text>
              <Ionicons name="play-forward" size={17} color="#5bc0de" />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {weekdays.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((date, index) => {
              const value = formatDate(date);
              const selected = value === selectedValue;
              const muted = date.getMonth() !== currentMonth;

              return (
                <Pressable
                  key={`${value}-${index}`}
                  onPress={() => onSelect(value)}
                  style={({ pressed }) => [
                    styles.dayButton,
                    selected && styles.dayButtonSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={[styles.dayText, muted && styles.dayTextMuted, selected && styles.dayTextSelected]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {yearPickerVisible ? (
            <View style={styles.yearPickerPanel}>
              <View style={styles.yearPickerHeader}>
                <Text style={styles.yearPickerTitle}>Choose Year</Text>
                <Pressable
                  accessibilityLabel="Close year picker"
                  onPress={() => setYearPickerVisible(false)}
                  style={styles.smallIconButton}
                >
                  <Ionicons name="close" size={18} color="#173f35" />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.yearGrid} style={styles.yearList}>
                {birthYears.map((year) => {
                  const selected = year === month.getFullYear();

                  return (
                    <Pressable
                      accessibilityLabel={`Select year ${year}`}
                      key={year}
                      onPress={() => selectYear(year)}
                      style={({ pressed }) => [
                        styles.yearOption,
                        selected && styles.yearOptionSelected,
                        pressed && styles.pressed
                      ]}
                    >
                      <Text style={[styles.yearOptionText, selected && styles.yearOptionTextSelected]}>{year}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function buildCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function dateFromValue(value) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(2000, 0, 1);
  }

  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f6faf8',
    flex: 1
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#dce8e3',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 58 : 28,
    paddingBottom: 12
  },
  headerIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  title: {
    color: '#113d32',
    fontSize: 18,
    fontWeight: '800'
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#5bc0de',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  disabled: {
    opacity: 0.5
  },
  content: {
    padding: 18,
    paddingBottom: 34
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6e1',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14
  },
  sectionTitle: {
    color: '#5bc0de',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 14
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 18
  },
  passportPicker: {
    alignItems: 'center',
    backgroundColor: '#e8f3ee',
    borderColor: '#b7ccc4',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 164,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 124
  },
  passportImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%'
  },
  passportPlaceholder: {
    alignItems: 'center',
    gap: 8
  },
  passportText: {
    color: '#365e52',
    fontSize: 13,
    fontWeight: '700'
  },
  removePhotoButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    padding: 8
  },
  removePhotoText: {
    color: '#b3261e',
    fontSize: 13,
    fontWeight: '700'
  },
  field: {
    marginBottom: 14
  },
  label: {
    color: '#244a40',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cfded8',
    borderRadius: 8,
    borderWidth: 1,
    color: '#183a32',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 13
  },
  multilineInput: {
    minHeight: 86,
    paddingTop: 12
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cfded8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 13
  },
  selectText: {
    color: '#183a32',
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 12
  },
  placeholderText: {
    color: '#8ca39c'
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  choice: {
    backgroundColor: '#ffffff',
    borderColor: '#cfded8',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  choiceSelected: {
    backgroundColor: '#5bc0de',
    borderColor: '#5bc0de'
  },
  choiceText: {
    color: '#365e52',
    fontSize: 13,
    fontWeight: '700'
  },
  choiceTextSelected: {
    color: '#ffffff'
  },
  modalOverlay: {
    backgroundColor: 'rgba(91, 192, 222, 0.32)',
    flex: 1,
    justifyContent: 'flex-end'
  },
  pickerPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: '82%',
    padding: 16
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  pickerTitle: {
    color: '#113d32',
    fontSize: 18,
    fontWeight: '900'
  },
  pickerSearch: {
    alignItems: 'center',
    backgroundColor: '#f4f8f6',
    borderColor: '#cfded8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 46,
    paddingHorizontal: 12
  },
  pickerSearchInput: {
    color: '#183a32',
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: 8
  },
  departmentList: {
    marginBottom: 10
  },
  departmentOption: {
    alignItems: 'center',
    borderBottomColor: '#eef3f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 4,
    paddingVertical: 10
  },
  departmentOptionSelected: {
    backgroundColor: '#f0faf5'
  },
  departmentOptionText: {
    color: '#244a40',
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  departmentOptionTextSelected: {
    color: '#5bc0de',
    fontWeight: '800'
  },
  calendarPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 16
  },
  calendarNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  calendarNavButton: {
    alignItems: 'center',
    backgroundColor: '#e8f3ee',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  calendarMonth: {
    color: '#173f35',
    fontSize: 16,
    fontWeight: '900'
  },
  yearNav: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 12
  },
  yearNavButton: {
    alignItems: 'center',
    backgroundColor: '#e8f3ee',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 10
  },
  yearNavText: {
    color: '#5bc0de',
    fontSize: 12,
    fontWeight: '800'
  },
  yearPickerButton: {
    alignItems: 'center',
    backgroundColor: '#f4f8f6',
    borderColor: '#cfded8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 104,
    paddingHorizontal: 12
  },
  yearPickerText: {
    color: '#173f35',
    fontSize: 15,
    fontWeight: '900'
  },
  weekdayRow: {
    flexDirection: 'row'
  },
  weekday: {
    color: '#60766f',
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center'
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  dayButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: `${100 / 7}%`
  },
  dayButtonSelected: {
    backgroundColor: '#5bc0de'
  },
  dayText: {
    color: '#173f35',
    fontSize: 14,
    fontWeight: '700'
  },
  dayTextMuted: {
    color: '#a0b1ac'
  },
  dayTextSelected: {
    color: '#ffffff'
  },
  yearPickerPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6e1',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 16,
    left: 16,
    maxHeight: 268,
    padding: 12,
    position: 'absolute',
    right: 16,
    top: 118
  },
  yearPickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  yearPickerTitle: {
    color: '#113d32',
    fontSize: 15,
    fontWeight: '900'
  },
  smallIconButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  yearList: {
    flex: 1
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8
  },
  yearOption: {
    alignItems: 'center',
    backgroundColor: '#f4f8f6',
    borderColor: '#dbe6e1',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: '22.8%'
  },
  yearOptionSelected: {
    backgroundColor: '#5bc0de',
    borderColor: '#5bc0de'
  },
  yearOptionText: {
    color: '#244a40',
    fontSize: 13,
    fontWeight: '800'
  },
  yearOptionTextSelected: {
    color: '#ffffff'
  },
  pressed: {
    opacity: 0.72
  }
});
