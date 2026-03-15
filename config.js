// Configuration for the gym tracker app

// Replace this with your published Google Sheet CSV URL
// Steps:
// 1. Open your Google Sheet
// 2. Go to File → Share → Publish to web
// 3. Select your data sheet, choose "CSV" format
// 4. Copy the URL and paste it below
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=YOUR_SHEET_GID';

// This will be set during Vercel deployment
// Add APPS_SCRIPT_URL as an environment variable in Vercel dashboard
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb/doPost';

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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SHEETS_CSV_URL, APPS_SCRIPT_URL, THEME };
}
