/**
 * Google Apps Script for Gym Tracker
 * Deploy this as a Web App to enable data syncing from the website
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Delete the default code
 * 4. Paste this entire script
 * 5. Click Deploy > New Deployment
 * 6. Select Type: Web app
 * 7. Execute as: [Your Google account]
 * 8. Who has access: Anyone
 * 9. Click Deploy
 * 10. Copy the Deployment URL
 * 11. Paste it into Vercel as APPS_SCRIPT_URL environment variable
 *
 * REQUIRED SHEET SETUP:
 * - Create a sheet named "Workouts" with these columns:
 *   A: Date
 *   B: Exercise
 *   C: Muscles
 *   D: Form Notes
 *   E: S1_Weight
 *   F: S1_Reps
 *   G: S2_Weight
 *   H: S2_Reps
 *   I: S3_Weight
 *   J: S3_Reps
 *   K: S4_Weight
 *   L: S4_Reps
 *   M: S5_Weight
 *   N: S5_Reps
 */

/**
 * Main handler for POST requests
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === 'logWorkout') {
      return logWorkout(payload.rows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      error: 'Unknown action',
      action: payload.action
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      message: 'Failed to process request'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Log workout rows to the sheet
 */
function logWorkout(rows) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Workouts');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Workouts', 0);
      initializeSheet(sheet);
    }

    // Add rows
    const lastRow = sheet.getLastRow();
    const startRow = lastRow + 1;

    rows.forEach((row, index) => {
      const rowNum = startRow + index;

      // Columns: A-N
      sheet.getRange(rowNum, 1).setValue(row.date);           // Date
      sheet.getRange(rowNum, 2).setValue(row.exercise);       // Exercise
      sheet.getRange(rowNum, 3).setValue(row.muscles);        // Muscles
      sheet.getRange(rowNum, 4).setValue(row.formNotes);      // Form Notes
      sheet.getRange(rowNum, 5).setValue(row.s1Weight || ''); // S1 Weight
      sheet.getRange(rowNum, 6).setValue(row.s1Reps || '');   // S1 Reps
      sheet.getRange(rowNum, 7).setValue(row.s2Weight || ''); // S2 Weight
      sheet.getRange(rowNum, 8).setValue(row.s2Reps || '');   // S2 Reps
      sheet.getRange(rowNum, 9).setValue(row.s3Weight || ''); // S3 Weight
      sheet.getRange(rowNum, 10).setValue(row.s3Reps || '');  // S3 Reps
      sheet.getRange(rowNum, 11).setValue(row.s4Weight || ''); // S4 Weight
      sheet.getRange(rowNum, 12).setValue(row.s4Reps || '');  // S4 Reps
      sheet.getRange(rowNum, 13).setValue(row.s5Weight || ''); // S5 Weight
      sheet.getRange(rowNum, 14).setValue(row.s5Reps || '');  // S5 Reps
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      rowsAdded: rows.length,
      message: `Successfully logged ${rows.length} exercise records`
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      message: 'Failed to log workout'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize the Workouts sheet with headers
 */
function initializeSheet(sheet) {
  const headers = [
    'Date',
    'Exercise',
    'Muscles',
    'Form Notes',
    'S1_Weight',
    'S1_Reps',
    'S2_Weight',
    'S2_Reps',
    'S3_Weight',
    'S3_Reps',
    'S4_Weight',
    'S4_Reps',
    'S5_Weight',
    'S5_Reps'
  ];

  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setFontWeight('bold');
  range.setBackground('#00d4ff');
  range.setFontColor('#0f0f13');
}
