# 💪 Gym Tracker

A modern, dark-themed web app for tracking your gym workouts, monitoring progress, and managing exercise performance data.

**Live Demo:** (will be available after Vercel deployment)

## Features

- **Dashboard** — Overview of your workout stats, sessions this month, volume trends, and top improved exercises
- **Log Workout** — Quick form to add new sessions with up to 5 sets per exercise
- **Progress** — Track individual exercises with volume charts, estimated 1RM progression, and historical data
- **History** — Browse all past sessions with expandable exercise details and volume comparisons

## Tech Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Charting**: Chart.js via CDN
- **Backend**: Vercel serverless functions (Node.js)
- **Database**: Google Sheets + Google Apps Script
- **Hosting**: Vercel (free tier)
- **Styling**: Dark theme with accent colors (#00d4ff)

## Quick Start

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Enter repository name: `gym-tracking`
3. Make it **Public**
4. Click **Create repository**
5. Clone it: `git clone https://github.com/YOUR_USERNAME/gym-tracking.git`
6. Copy all files from this project into the cloned directory
7. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: gym tracker app"
   git push origin main
   ```

### Step 2: Set Up Google Sheet

1. **Create a new Google Sheet** (or use an existing one)
2. **Rename the first sheet** to "Workouts"
3. **Add column headers** (row 1):
   - A: Date
   - B: Exercise
   - C: Muscles
   - D: Form Notes
   - E: S1_Weight
   - F: S1_Reps
   - G: S2_Weight
   - H: S2_Reps
   - I: S3_Weight
   - J: S3_Reps
   - K: S4_Weight
   - L: S4_Reps
   - M: S5_Weight
   - N: S5_Reps

4. **Publish to web as CSV**:
   - File → Share → "Share" button (top right) → **Publish to web**
   - Select your "Workouts" sheet
   - Choose format: **CSV**
   - Copy the URL
   - Go to Vercel (step 3) and set this as `SHEETS_CSV_URL` in the deployed environment

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select your `gym-tracking` repository
5. Click **Import**
6. Under "Environment Variables", add:
   - **Name**: `APPS_SCRIPT_URL`
   - **Value**: (leave blank for now, will update in Step 4)
7. Click **Deploy**
8. After deployment, copy your site URL (e.g., `https://gym-tracker-xyz.vercel.app`)

### Step 4: Set Up Google Apps Script

1. **Open your Google Sheet** (from Step 2)
2. Click **Extensions** → **Apps Script**
3. Delete the default code
4. Copy and paste the entire code from [GOOGLE_APPS_SCRIPT.gs](./GOOGLE_APPS_SCRIPT.gs)
5. Click **Deploy** (top right) → **New Deployment**
6. **Type**: Select "Web app"
7. **Execute as**: Select your Google account
8. **Who has access**: Select "Anyone"
9. Click **Deploy**
10. **Copy the deployment URL** from the popup (looks like: `https://script.google.com/macros/d/ABC123/userweb`)

### Step 5: Update Vercel with Apps Script URL

1. Go back to [vercel.com](https://vercel.com)
2. Select your `gym-tracker` project
3. Go to **Settings** → **Environment Variables**
4. Update `APPS_SCRIPT_URL` with the URL from Step 4
5. Click **Save**
6. Redeploy: Go to **Deployments** → click the latest one → click **Redeploy**

### Step 6: Configure Website

1. Open your Vercel site in a browser
2. You should see the Dashboard with your historical data loaded
3. The site is now fully functional!

## Usage

### Logging a Workout

1. Click **Log Workout** in the navigation
2. Set the session date (defaults to today)
3. Click **+ Add Exercise**
4. Enter exercise name (autocomplete from your history)
5. Enter weight and reps for up to 5 sets
6. Click **+ Add Exercise** to add more exercises to this session
7. Click **Save Workout**
8. Data is automatically sent to your Google Sheet

### Viewing Progress

1. Click **Progress** in the navigation
2. Select an exercise from the dropdown
3. View:
   - Volume progression chart
   - Estimated 1RM progression
   - Recent session stats
4. Charts update automatically as you log new workouts

### Reviewing History

1. Click **History** in the navigation
2. Sessions are listed newest first
3. Click any session to expand and see all exercises
4. Volume changes vs previous session are highlighted

## Data Format

All workouts are stored in your Google Sheet in flat format:

| Date | Exercise | Muscles | Form Notes | S1_Weight | S1_Reps | S2_Weight | S2_Reps | ... |
|------|----------|---------|------------|-----------|---------|-----------|---------|-----|
| 13/12/2025 | Bench Press | Chest, Delts, Triceps | Notes... | 60 | 8 | 65 | 6 | ... |

The website reads from this sheet automatically.

## Customization

### Change Theme Colors

Edit `style.css` and update the CSS custom properties in `:root`:

```css
:root {
  --bg: #0f0f13;           /* Dark background */
  --accent: #00d4ff;       /* Cyan accent */
  --text: #ffffff;         /* White text */
  --success: #00ff88;      /* Green for improvements */
  --danger: #ff4444;       /* Red for decreases */
}
```

### Add More Pages

Create new `.html` files in the root directory. Use the existing pages as templates. They all:
1. Import `style.css` for styling
2. Import `data.js` for data loading
3. Call `initializeData()` to load seed data

### Modify 1RM Calculation

Edit the `calculate1RM()` function in `data.js`:

```javascript
// Current: Epley formula
return weight * (1 + reps / 30);

// Alternative: Brzycki formula
return weight * 36 / (37 - reps);
```

## File Structure

```
gym-tracking/
├── index.html               # Dashboard page
├── log.html                 # Log workout form
├── progress.html            # Exercise progress charts
├── history.html             # Past sessions list
├── style.css                # Dark theme stylesheet
├── config.js                # Configuration (API URLs)
├── data.js                  # Data loading & utilities
├── charts.js                # Chart.js helpers
├── api/
│   └── log-workout.js       # Vercel serverless function
├── data/
│   └── seed.json            # Historical workout data
├── GOOGLE_APPS_SCRIPT.gs    # Script to paste into Google Sheet
├── vercel.json              # Vercel deployment config
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Troubleshooting

### "Data not loading on dashboard"
- Check browser console (F12) for errors
- Verify `seed.json` exists and is valid JSON
- Ensure all `.js` files are properly imported in HTML files

### "Can't save workouts from the website"
- Check that `APPS_SCRIPT_URL` is set in Vercel environment variables
- Verify Google Apps Script is deployed and URL is correct
- Check browser console for the actual error
- Make sure your Google Sheet has the "Workouts" sheet with proper headers

### "Charts not showing"
- Verify Chart.js CDN link is loading (check Network tab in DevTools)
- Check console for JavaScript errors
- Ensure `progress.html` imports both `data.js` and `charts.js`

### "CSV data not syncing from Google Sheets"
- Verify the published CSV URL is correct in `config.js`
- Try opening the CSV URL in your browser to see if it loads
- Check that your Google Sheet is publicly published

## Performance Notes

- The site loads 300+ rows of historical data from your seed data file
- Filtering by exercise is instant (done in JavaScript)
- Charts are rendered client-side using Chart.js
- API calls to Google Sheets are cached in the browser

## Privacy & Data

- Your workout data is stored in your Google Sheet (you own it)
- The Vercel function only forwards data to Google Apps Script
- No data is sent to third-party analytics
- Site is publicly viewable (customize access if needed)

## Future Enhancements

- Export data to CSV
- Body weight tracking
- Photo progress gallery
- Mobile app
- Workout templates/routines
- Sharing workouts with friends

## License

MIT

---

Made with 💪 by Claude Code
