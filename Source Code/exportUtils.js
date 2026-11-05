import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function csvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function studentRows(student) {
  return [
    ['Full Name', student.fullName],
    ['Matric Number', student.matricNumber],
    ['Department', student.department],
    ['Date of Birth', student.dateOfBirth],
    ['Level', student.level],
    ['Gender', student.gender],
    ['Phone', student.phone],
    ['Email', student.email || 'Not provided'],
    ['Address', student.address || 'Not provided']
  ];
}

function studentHtml(student) {
  const passport = student.passportUri
    ? `<img class="passport" src="${escapeHtml(student.passportUri)}" />`
    : '<div class="passport empty">No photo</div>';

  return `
    <section class="student">
      <div class="heading">
        ${passport}
        <div>
          <h2>${escapeHtml(student.fullName)}</h2>
          <p>${escapeHtml(student.matricNumber)}</p>
          <p>${escapeHtml(student.department)}</p>
        </div>
      </div>
      <h3>Personal Information</h3>
      <table>
        <tr><th>Date of Birth</th><td>${escapeHtml(student.dateOfBirth)}</td></tr>
        <tr><th>Gender</th><td>${escapeHtml(student.gender)}</td></tr>
      </table>
      <h3>Academic Information</h3>
      <table>
        <tr><th>Department</th><td>${escapeHtml(student.department)}</td></tr>
        <tr><th>Level</th><td>${escapeHtml(student.level)}</td></tr>
        <tr><th>Matric Number</th><td>${escapeHtml(student.matricNumber)}</td></tr>
      </table>
      <h3>Contact Information</h3>
      <table>
        <tr><th>Phone</th><td>${escapeHtml(student.phone)}</td></tr>
        <tr><th>Email</th><td>${escapeHtml(student.email || 'Not provided')}</td></tr>
        <tr><th>Address</th><td>${escapeHtml(student.address || 'Not provided')}</td></tr>
      </table>
    </section>
  `;
}

function documentHtml(title, body) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { color: #173f35; font-family: Arial, sans-serif; margin: 32px; }
          h1 { color: #5bc0de; font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 20px; margin: 0 0 4px; }
          h3 { background: #e8f3ee; border-left: 4px solid #5bc0de; font-size: 14px; margin: 22px 0 8px; padding: 8px; }
          p { color: #4d665f; margin: 0 0 4px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #dbe6e1; font-size: 13px; padding: 9px; text-align: left; vertical-align: top; }
          th { background: #f4f8f6; width: 34%; }
          .student { page-break-inside: avoid; margin-top: 22px; }
          .heading { align-items: center; display: flex; gap: 16px; }
          .passport { border: 1px solid #cfded8; border-radius: 8px; height: 120px; object-fit: cover; width: 92px; }
          .empty { align-items: center; background: #edf4f1; color: #60766f; display: flex; justify-content: center; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Student Records Management - Department of Computer Science</p>
        ${body}
      </body>
    </html>
  `;
}

export async function shareStudentPdf(student) {
  const { uri } = await Print.printToFileAsync({
    html: documentHtml('DELSU Student Profile', studentHtml(student))
  });

  await Sharing.shareAsync(uri, {
    dialogTitle: `Share ${student.fullName} as PDF`,
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf'
  });
}

export async function shareStudentsPdf(students) {
  const body = students.map(studentHtml).join('');
  const { uri } = await Print.printToFileAsync({
    html: documentHtml('DELSU Student Records', body || '<p>No student records available.</p>')
  });

  await Sharing.shareAsync(uri, {
    dialogTitle: 'Export student records as PDF',
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf'
  });
}

export async function shareStudentsCsv(students) {
  const header = [
    'Full Name',
    'Matric Number',
    'Department',
    'Date of Birth',
    'Level',
    'Gender',
    'Phone',
    'Email',
    'Address'
  ];
  const rows = students.map((student) => studentRows(student).map(([, value]) => csvValue(value)).join(','));
  const csv = [header.map(csvValue).join(','), ...rows].join('\n');
  const uri = `${FileSystem.cacheDirectory}delsu-student-records.csv`;

  await FileSystem.writeAsStringAsync(uri, csv, {
    encoding: FileSystem.EncodingType.UTF8
  });

  await Sharing.shareAsync(uri, {
    dialogTitle: 'Export student records as CSV',
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text'
  });
}
