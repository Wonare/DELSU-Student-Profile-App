import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from './components/EmptyState';
import StudentCard from './components/StudentCard';
import StudentForm from './components/StudentForm';
import { departments, levels } from './constants';
import {
  shareStudentPdf,
  shareStudentsCsv,
  shareStudentsPdf
} from './exportUtils';
import {
  addStudent,
  deleteStudent,
  fetchStudents,
  initializeDatabase,
  updateStudent
} from './db';

export default function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [levelSort, setLevelSort] = useState('All Levels');
  const [departmentSort, setDepartmentSort] = useState('All Departments');
  const [sortPicker, setSortPicker] = useState(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const levelMatches = levelSort === 'All Levels' || student.level === levelSort;
      const departmentMatches = departmentSort === 'All Departments' || student.department === departmentSort;

      return levelMatches && departmentMatches;
    });
  }, [departmentSort, levelSort, students]);

  const totalLabel = useMemo(() => {
    if (filteredStudents.length === 1) {
      return '1 student record';
    }

    return `${filteredStudents.length} student records`;
  }, [filteredStudents.length]);

  const loadStudents = useCallback(async (term = '') => {
    const records = await fetchStudents(term);
    setStudents(records);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeDatabase();
        await loadStudents('');
      } catch (error) {
        Alert.alert('Database error', readableError(error));
      } finally {
        setLoading(false);
      }
    }

    prepare();
  }, [loadStudents]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents(searchTerm).catch((error) => {
        Alert.alert('Search error', readableError(error));
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [loadStudents, searchTerm]);

  function openCreateForm() {
    setSelectedStudent(null);
    setFormVisible(true);
  }

  function openEditForm(student) {
    setSelectedStudent(student);
    setFormVisible(true);
  }

  async function saveStudent(form) {
    setSaving(true);

    try {
      if (selectedStudent?.id) {
        await updateStudent(selectedStudent.id, form);
      } else {
        await addStudent(form);
      }

      await loadStudents(searchTerm);
      setFormVisible(false);
      setSelectedStudent(null);
    } catch (error) {
      Alert.alert('Save failed', readableError(error));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(student) {
    Alert.alert(
      'Delete student?',
      `Remove ${student.fullName} from DELSU Student Profile records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(student.id);
              await loadStudents(searchTerm);
            } catch (error) {
              Alert.alert('Delete failed', readableError(error));
            }
          }
        }
      ]
    );
  }

  async function exportPdf() {
    setMenuVisible(false);

    try {
      await shareStudentsPdf(filteredStudents);
    } catch (error) {
      Alert.alert('PDF export failed', readableError(error));
    }
  }

  async function exportCsv() {
    setMenuVisible(false);

    try {
      await shareStudentsCsv(filteredStudents);
    } catch (error) {
      Alert.alert('CSV export failed', readableError(error));
    }
  }

  async function shareSinglePdf(student) {
    try {
      await shareStudentPdf(student);
    } catch (error) {
      Alert.alert('PDF share failed', readableError(error));
    }
  }

  if (welcomeVisible) {
    return (
      <SafeAreaView style={styles.welcomeSafeArea}>
        <ExpoStatusBar style="light" />
        <View style={styles.welcomeScreen}>
          <View style={styles.welcomeLogo}>
            <Ionicons name="school" size={42} color="#ffffff" />
          </View>
          <Text style={styles.welcomeTitle}>DELSU Student Profile</Text>
          <Text style={styles.welcomeSubtitle}>
            Student Records Management{'\n'}Department of Computer Science
          </Text>
          <Pressable
            accessibilityLabel="Open dashboard"
            onPress={() => setWelcomeVisible(false)}
            style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
          >
            <Text style={styles.startButtonText}>Open Dashboard</Text>
            <Ionicons name="arrow-forward" size={20} color="#5bc0de" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <View style={styles.app}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Ionicons name="school" size={24} color="#ffffff" />
              </View>
              <View style={styles.brandText}>
                <Text style={styles.appName}>DELSU Student Profile</Text>
                <Text style={styles.subtitle}>Manage and organise student records</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Open menu"
              onPress={() => setMenuVisible(true)}
              style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#ffffff" />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Add student profile"
            onPress={openCreateForm}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={22} color="#5bc0de" />
            <Text style={styles.addButtonText}>Add Student</Text>
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={19} color="#627a72" />
            <TextInput
              accessibilityLabel="Search student records"
              onChangeText={setSearchTerm}
              placeholder="Search records"
              placeholderTextColor="#829891"
              style={styles.searchInput}
              value={searchTerm}
            />
            {searchTerm ? (
              <Pressable
                accessibilityLabel="Clear search"
                onPress={() => setSearchTerm('')}
                style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
              >
                <Ionicons name="close-circle" size={19} color="#627a72" />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={styles.sortRow}
            showsHorizontalScrollIndicator={false}
          >
            <SortButton
              icon="stats-chart-outline"
              label={levelSort}
              onPress={() => setSortPicker('level')}
            />
            <SortButton
              icon="business-outline"
              label={departmentSort}
              onPress={() => setSortPicker('department')}
            />
            {(levelSort !== 'All Levels' || departmentSort !== 'All Departments') ? (
              <Pressable
                accessibilityLabel="Clear sorting filters"
                onPress={() => {
                  setLevelSort('All Levels');
                  setDepartmentSort('All Departments');
                }}
                style={({ pressed }) => [styles.clearSortButton, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={17} color="#b3261e" />
                <Text style={styles.clearSortText}>Clear</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <Text style={styles.totalLabel}>{totalLabel}</Text>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color="#5bc0de" size="large" />
            <Text style={styles.loaderText}>Loading records...</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={filteredStudents.length ? styles.listContent : styles.emptyContent}
            data={filteredStudents}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<EmptyState searching={Boolean(searchTerm.trim())} />}
            renderItem={({ item }) => (
              <StudentCard
                student={item}
                onDelete={confirmDelete}
                onEdit={openEditForm}
                onSharePdf={shareSinglePdf}
              />
            )}
          />
        )}
      </View>

      <StudentForm
        onClose={() => {
          setFormVisible(false);
          setSelectedStudent(null);
        }}
        onSubmit={saveStudent}
        saving={saving}
        student={selectedStudent}
        visible={formVisible}
      />

      <MenuModal
        onAbout={() => {
          setMenuVisible(false);
          setAboutVisible(true);
        }}
        onClose={() => setMenuVisible(false)}
        onCsv={exportCsv}
        onDashboard={() => {
          setMenuVisible(false);
          setWelcomeVisible(false);
        }}
        onPdf={exportPdf}
        visible={menuVisible}
      />

      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />

      <SortPicker
        onClose={() => setSortPicker(null)}
        onSelect={(value) => {
          if (sortPicker === 'level') {
            setLevelSort(value);
          } else {
            setDepartmentSort(value);
          }
          setSortPicker(null);
        }}
        options={sortPicker === 'level' ? ['All Levels', ...levels] : ['All Departments', ...departments]}
        selectedValue={sortPicker === 'level' ? levelSort : departmentSort}
        title={sortPicker === 'level' ? 'Sort by Level' : 'Sort by Department'}
        visible={Boolean(sortPicker)}
      />
    </SafeAreaView>
  );
}

function SortButton({ icon, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={16} color="#5bc0de" />
      <Text style={styles.sortButtonText} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={15} color="#60766f" />
    </Pressable>
  );
}

function MenuModal({ onAbout, onClose, onCsv, onDashboard, onPdf, visible }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuPanel}>
          <MenuItem icon="grid-outline" label="Dashboard" onPress={onDashboard} />
          <MenuItem icon="document-text-outline" label="Export as PDF" onPress={onPdf} />
          <MenuItem icon="reader-outline" label="Export as CSV" onPress={onCsv} />
          <MenuItem icon="information-circle-outline" label="About" onPress={onAbout} />
        </View>
      </Pressable>
    </Modal>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
      <Ionicons name={icon} size={19} color="#5bc0de" />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );
}

function AboutModal({ onClose, visible }) {
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.aboutSafeArea}>
        <View style={styles.aboutHeader}>
          <Text style={styles.aboutHeaderTitle}>About</Text>
          <Pressable accessibilityLabel="Close about screen" onPress={onClose} style={styles.aboutCloseButton}>
            <Ionicons name="close" size={24} color="#173f35" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.aboutContent}>
          <Text style={styles.aboutTitle}>About DELSU Student Profile</Text>
          <Text style={styles.aboutText}>
            DELSU Student Profile is a mobile application for managing student records, including passport
            photographs, names, matriculation numbers, departments, dates of birth, levels, genders, and
            contact details.
          </Text>
          <Text style={styles.aboutText}>
            The app allows users to add, view, search, edit, delete, and export student records. All data is
            stored securely on the device using an SQLite database.
          </Text>
          <Text style={styles.developedBy}>Developed by:</Text>
          <Text style={styles.aboutText}>
            Chinye Nneamaka Precious{'\n'}
            Department of Computer Science{'\n'}
            Delta State University, Abraka (DELSU).
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SortPicker({ onClose, onSelect, options, selectedValue, title, visible }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sortOverlay}>
        <View style={styles.sortPanel}>
          <View style={styles.sortHeader}>
            <Text style={styles.sortTitle}>{title}</Text>
            <Pressable accessibilityLabel="Close sort picker" onPress={onClose} style={styles.aboutCloseButton}>
              <Ionicons name="close" size={22} color="#173f35" />
            </Pressable>
          </View>
          <ScrollView>
            {options.map((option) => {
              const selected = selectedValue === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => onSelect(option)}
                  style={({ pressed }) => [
                    styles.sortOption,
                    selected && styles.sortOptionSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={[styles.sortOptionText, selected && styles.sortOptionTextSelected]}>
                    {option}
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

function readableError(error) {
  if (error?.message?.includes('UNIQUE')) {
    return 'A student with this matric number already exists.';
  }

  return error?.message || 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  welcomeSafeArea: {
    backgroundColor: '#5bc0de',
    flex: 1
  },
  welcomeScreen: {
    alignItems: 'center',
    backgroundColor: '#5bc0de',
    flex: 1,
    justifyContent: 'center',
    padding: 28
  },
  welcomeLogo: {
    alignItems: 'center',
    backgroundColor: '#5bc0de',
    borderRadius: 8,
    height: 86,
    justifyContent: 'center',
    marginBottom: 22,
    width: 86
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center'
  },
  welcomeSubtitle: {
    color: '#d4e8e1',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center'
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginTop: 34,
    minHeight: 50,
    paddingHorizontal: 18
  },
  startButtonText: {
    color: '#5bc0de',
    fontSize: 15,
    fontWeight: '900'
  },
  safeArea: {
    backgroundColor: '#5bc0de',
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  app: {
    backgroundColor: '#f4f8f6',
    flex: 1
  },
  header: {
    backgroundColor: '#5bc0de',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18
  },
  headerTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  brandRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: '#5bc0de',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  brandText: {
    flex: 1,
    minWidth: 0
  },
  appName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27
  },
  subtitle: {
    color: '#cbe2da',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 14
  },
  addButtonText: {
    color: '#5bc0de',
    fontSize: 14,
    fontWeight: '800'
  },
  toolbar: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#dce8e3',
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#f4f8f6',
    borderColor: '#cfded8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 46,
    paddingHorizontal: 12
  },
  searchInput: {
    color: '#183a32',
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: 8
  },
  clearButton: {
    padding: 5
  },
  sortRow: {
    gap: 8,
    paddingTop: 10
  },
  sortButton: {
    alignItems: 'center',
    backgroundColor: '#e8f3ee',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    maxWidth: 230,
    minHeight: 38,
    paddingHorizontal: 12
  },
  sortButtonText: {
    color: '#244a40',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800'
  },
  clearSortButton: {
    alignItems: 'center',
    backgroundColor: '#fdecea',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 12
  },
  clearSortText: {
    color: '#b3261e',
    fontSize: 13,
    fontWeight: '800'
  },
  totalLabel: {
    color: '#5e746d',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9
  },
  listContent: {
    padding: 16,
    paddingBottom: 32
  },
  emptyContent: {
    flexGrow: 1
  },
  loader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  loaderText: {
    color: '#5e746d',
    fontSize: 14,
    marginTop: 12
  },
  menuOverlay: {
    flex: 1,
    paddingRight: 14,
    paddingTop: Platform.OS === 'android' ? 64 : 54
  },
  menuPanel: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff',
    borderColor: '#dbe6e1',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 6,
    minWidth: 210,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 14
  },
  menuItemText: {
    color: '#173f35',
    fontSize: 14,
    fontWeight: '800'
  },
  aboutSafeArea: {
    backgroundColor: '#f4f8f6',
    flex: 1
  },
  aboutHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#dce8e3',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  aboutHeaderTitle: {
    color: '#113d32',
    fontSize: 18,
    fontWeight: '900'
  },
  aboutCloseButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  aboutContent: {
    padding: 20
  },
  aboutTitle: {
    color: '#5bc0de',
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 30,
    marginBottom: 16
  },
  aboutText: {
    color: '#314b43',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 16
  },
  developedBy: {
    color: '#173f35',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 4
  },
  sortOverlay: {
    backgroundColor: 'rgba(91, 192, 222, 0.32)',
    flex: 1,
    justifyContent: 'flex-end'
  },
  sortPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: '78%',
    padding: 16
  },
  sortHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  sortTitle: {
    color: '#113d32',
    fontSize: 18,
    fontWeight: '900'
  },
  sortOption: {
    alignItems: 'center',
    borderBottomColor: '#eef3f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: 10
  },
  sortOptionSelected: {
    backgroundColor: '#f0faf5'
  },
  sortOptionText: {
    color: '#244a40',
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  sortOptionTextSelected: {
    color: '#5bc0de',
    fontWeight: '800'
  },
  pressed: {
    opacity: 0.75
  }
});
