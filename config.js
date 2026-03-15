// Configuration for the gym tracker app

// Google Sheet CSV URL for reading workout data
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbzd3KScVzIGUT4Df3WBxmYGUxAPLr0o0eck8_X0P98gItjWaMvgxVYANjHlJRDIsByr3yR5fbfp9e/pub?gid=1141952819&single=true&output=csv';

// Google Apps Script URL for logging workouts (set via Vercel env var)
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxfW1DTodLaDKkkn3OEpDhcn-YIA0UfBsV_oabOCQd3AZgo8RxxO5brZizoc3J-drnq/exec';

// Color theme
const THEME = {
  bg: '#0f0f13',
  accent: '#00d4ff',
  accentDark: '#0099cc',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  cardBg: '#1a1a20',
  borderColor: '#2a2a2f',
  success: '#00ff88',
  danger: '#ff4444',
  warning: '#ffaa00'
};

