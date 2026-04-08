/**
 * Data handling for gym tracker
 * - Loads seed data from seed.json
 * - Fetches live data from Google Sheets CSV
 * - Provides utility functions for data analysis
 */

let allData = [];

/**
 * Initialize data - load from Google Sheets if configured, fall back to seed.json
 */
async function initializeData() {
  try {
    // Try to load from Google Sheets first (if SHEETS_CSV_URL is configured)
    if (typeof SHEETS_CSV_URL !== 'undefined' && !SHEETS_CSV_URL.includes('YOUR_SHEET_ID')) {
      try {
        let data = await fetchFromGoogleSheets(SHEETS_CSV_URL);
        if (data && data.length > 0) {
          data = combineDuplicateExercises(data);
          allData = data;
          console.log(`Loaded ${allData.length} exercises from Google Sheets`);
          return allData;
        }
      } catch (sheetsError) {
        console.warn('Could not load from Google Sheets, falling back to seed data:', sheetsError);
      }
    }

    // Fall back to seed.json
    const response = await fetch('/data/seed.json');
    let data = await response.json();
    data = combineDuplicateExercises(data);
    allData = data;
    console.log(`Loaded ${allData.length} exercises from seed data`);
    return allData;
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
}

/**
 * Combine exercises with the same name on the same date into single records
 */
function combineDuplicateExercises(data) {
  const combined = {};

  data.forEach(record => {
    const key = `${record.date}|${record.exercise}`;

    if (!combined[key]) {
      combined[key] = { ...record };
    } else {
      // Merge sets
      combined[key].sets = [...combined[key].sets, ...record.sets];
    }
  });

  return Object.values(combined);
}

/**
 * Fetch data from Google Sheets CSV
 * @param {string} csvUrl - URL of published Google Sheet CSV
 * @returns {Promise<Array>} Array of parsed workouts
 */
async function fetchFromGoogleSheets(csvUrl) {
  try {
    const response = await fetch(csvUrl);
    const csv = await response.text();
    const parsed = parseCSV(csv);
    console.log(`Fetched ${parsed.length} exercises from Google Sheets`);
    return parsed;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
}

/**
 * Parse CSV data into workouts array
 * Expected columns: Date, Exercise, Muscles, Form Notes, S1_Weight, S1_Reps, S2_Weight, S2_Reps, ...
 */
function parseCSV(csv) {
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
  const workouts = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row && row.date && row.exercise) {
      workouts.push(row);
    }
  }

  return workouts;
}

/**
 * Parse a single CSV row with proper quoted field handling
 */
function parseCSVRow(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (outside quotes)
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());

  if (parts.length < 4) return null;

  const parseNum = (str) => {
    if (!str || str === '0' || str === '0.') return null;
    const num = parseFloat(str.replace(/,/g, ''));
    return isNaN(num) ? null : num;
  };

  const sets = [];
  for (let i = 4; i < parts.length; i += 2) {
    const weight = parseNum(parts[i]);
    const reps = parseNum(parts[i + 1]);
    if (weight !== null && reps !== null) {
      sets.push({ weight, reps });
    }
  }

  if (sets.length === 0) return null;

  return {
    date: parts[0],
    exercise: parts[1],
    muscles: parts[2],
    formNotes: parts[3],
    sets: sets,
    location: (parts[14] || '').toLowerCase().trim() || 'gym',
    notes: (parts[15] || '').trim(),
    summary: (parts[16] || '').trim()
  };
}

/**
 * Get all unique exercises
 */
function getAllExercises() {
  const exercises = {};
  allData.forEach(record => {
    if (!exercises[record.exercise]) {
      exercises[record.exercise] = {
        name: record.exercise,
        muscles: record.muscles,
        formNotes: record.formNotes
      };
    }
  });
  return Object.values(exercises).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all records for a specific exercise
 */
function getExerciseRecords(exerciseName) {
  return allData.filter(r => r.exercise === exerciseName)
    .sort((a, b) => new Date(parseDate(a.date)) - new Date(parseDate(b.date)));
}

/**
 * Parse date string "13/12/2025" to Date object
 */
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get all sessions grouped by date
 */
function getSessions() {
  const sessionMap = {};

  allData.forEach(record => {
    if (!sessionMap[record.date]) {
      sessionMap[record.date] = {
        date: record.date,
        location: record.location || 'gym',
        summary: record.summary || '',
        exercises: []
      };
    }
    sessionMap[record.date].exercises.push(record);
  });

  // Sort by date descending
  return Object.values(sessionMap).sort((a, b) =>
    new Date(parseDate(b.date)) - new Date(parseDate(a.date))
  );
}

/**
 * Calculate total volume for a record (weight × reps summed across all sets)
 */
function calculateVolume(record) {
  return record.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
}

/**
 * Calculate estimated 1RM using Epley formula: weight × (1 + reps/30)
 */
function calculate1RM(weight, reps) {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Get best 1RM for an exercise
 */
function getBest1RM(exerciseName) {
  const records = getExerciseRecords(exerciseName);
  let best = 0;
  records.forEach(record => {
    record.sets.forEach(set => {
      const orm = calculate1RM(set.weight, set.reps);
      if (orm > best) best = orm;
    });
  });
  return best;
}

/**
 * Calculate workout frequency by week
 */
function calculateFrequency() {
  const sessions = getSessions();
  const weekMap = {};

  sessions.forEach(session => {
    const sessionDate = parseDate(session.date);
    const weekStart = new Date(sessionDate);
    const day = weekStart.getDay();
    const diffToMonday = (day === 0) ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMonday);
    const weekLabel = formatDate(`${weekStart.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`);

    if (!weekMap[weekLabel]) {
      weekMap[weekLabel] = {
        week: weekLabel,
        count: 0,
        exerciseSets: {}
      };
    }

    weekMap[weekLabel].count++;

    session.exercises.forEach(ex => {
      const name = ex.exercise;
      if (!weekMap[weekLabel].exerciseSets[name]) {
        weekMap[weekLabel].exerciseSets[name] = 0;
      }
      weekMap[weekLabel].exerciseSets[name] += ex.sets.length;
    });
  });

  return Object.values(weekMap).reverse();
}

/**
 * Calculate stats for a dashboard
 */
function calculateDashboardStats() {
  const sessions = getSessions();
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastLastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  let sessionsThisMonth = 0;
  let setsThisWeek = 0;
  let setsLastWeek = 0;
  let daysSinceLastSession = null;

  sessions.forEach(session => {
    const sessionDate = parseDate(session.date);
    const sets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    if (sessionDate >= thisMonth) {
      sessionsThisMonth++;
    }

    if (sessionDate >= lastWeek) {
      setsThisWeek += sets;
    } else if (sessionDate >= lastLastWeek) {
      setsLastWeek += sets;
    }

    if (daysSinceLastSession === null) {
      daysSinceLastSession = Math.floor((today - sessionDate) / (24 * 60 * 60 * 1000));
    }
  });

  return {
    totalSessions: sessions.length,
    sessionsThisMonth,
    setsThisWeek,
    setsLastWeek,
    setsChange: setsLastWeek > 0 ? ((setsThisWeek - setsLastWeek) / setsLastWeek * 100) : 0,
    daysSinceLastSession,
    lastSessionDate: sessions.length > 0 ? sessions[0].date : null
  };
}

/**
 * Get top improved exercises
 */
function getTopImprovedExercises(limit = 3) {
  const exercises = getAllExercises();
  const improvements = exercises.map(ex => {
    const records = getExerciseRecords(ex.name);
    if (records.length < 2) return null;

    const first = calculateVolume(records[0]);
    const last = calculateVolume(records[records.length - 1]);
    const improvement = ((last - first) / first) * 100;

    return {
      name: ex.name,
      improvement,
      firstVolume: first,
      lastVolume: last
    };
  }).filter(x => x !== null)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, limit);

  return improvements;
}

/**
 * Format large numbers for display
 */
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(0);
}
