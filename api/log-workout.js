/**
 * Vercel Serverless Function: Log Workout
 * POSTs workout data to Google Apps Script Web App
 *
 * Environment Variables needed in Vercel:
 * - APPS_SCRIPT_URL: URL of deployed Google Apps Script Web App
 *
 * Expected body:
 * {
 *   date: "DD/MM/YYYY",
 *   exercises: [
 *     {
 *       name: "Exercise Name",
 *       muscles: "Muscle groups",
 *       notes: "Form notes",
 *       sets: [{ weight: 30, reps: 8 }, ...]
 *     }
 *   ]
 * }
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, exercises } = req.body;

    // Validate
    if (!date || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Send to Google Apps Script
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!appsScriptUrl) {
      return res.status(500).json({
        error: 'APPS_SCRIPT_URL not configured',
        message: 'Please add APPS_SCRIPT_URL to Vercel environment variables'
      });
    }

    // For each exercise, create row(s) in the sheet
    const rows = [];
    exercises.forEach(exercise => {
      // Prepare set data (up to 5 sets, each with weight and reps)
      const setData = {};
      for (let i = 0; i < Math.min(exercise.sets.length, 5); i++) {
        setData[`s${i + 1}Weight`] = exercise.sets[i].weight;
        setData[`s${i + 1}Reps`] = exercise.sets[i].reps;
      }

      rows.push({
        date: date,
        exercise: exercise.name,
        muscles: exercise.muscles,
        formNotes: exercise.notes || '',
        ...setData
      });
    });

    // Call Google Apps Script
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'logWorkout',
        rows: rows
      })
    });

    if (!response.ok) {
      console.error(`Apps Script error: ${response.status}`);
      return res.status(500).json({
        error: 'Failed to save to Google Sheets',
        status: response.status
      });
    }

    const result = await response.json();

    return res.status(200).json({
      success: true,
      message: `Logged ${exercises.length} exercises`,
      result: result
    });
  } catch (error) {
    console.error('Error in log-workout:', error);
    return res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
