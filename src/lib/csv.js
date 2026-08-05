// Minimal CSV helpers — no dependency needed for the shapes we deal with here.

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// columns: [{ key: 'field_name', label: 'Header' }]
export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(c.format ? c.format(row[c.key], row) : row[c.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Very small CSV parser — handles quoted fields with commas/newlines, which is
// all we need for pasted/uploaded participant lists.
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

// Parses a CSV of participants into objects, matching headers loosely
// (case-insensitive, spaces/underscores interchangeable) against known field names.
const PARTICIPANT_FIELD_ALIASES = {
  full_name: ['full name', 'fullname', 'name'],
  organization: ['organization', 'organisation', 'org'],
  designation: ['designation', 'title', 'role'],
  gender: ['gender', 'sex'],
  contact_email: ['contact email', 'email'],
  contact_number: ['contact number', 'phone', 'phone number', 'contact'],
  attendance_status: ['attendance status', 'attendance', 'status'],
};

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/_/g, ' ');
}

export function parseParticipantsCSV(text) {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];

  const headerRow = rows[0].map(normalizeHeader);
  const fieldForColumn = headerRow.map((h) => {
    const match = Object.entries(PARTICIPANT_FIELD_ALIASES).find(([, aliases]) =>
      aliases.includes(h)
    );
    return match ? match[0] : null;
  });

  // If nothing matched a known header, assume no header row and use position:
  // full_name, organization, designation, gender, contact_email, contact_number
  const hasHeader = fieldForColumn.some(Boolean);
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const columns = hasHeader
    ? fieldForColumn
    : ['full_name', 'organization', 'designation', 'gender', 'contact_email', 'contact_number'];

  return dataRows
    .map((row) => {
      const record = {};
      columns.forEach((field, idx) => {
        if (field && row[idx] !== undefined) record[field] = row[idx].trim();
      });
      return record;
    })
    .filter((r) => r.full_name);
}
