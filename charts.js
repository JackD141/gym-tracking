/**
 * Chart utilities using Chart.js
 * Load Chart.js from CDN in HTML: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 */

const THEME = {
  bg: '#f8f9fa',
  accent: '#0066cc',
  accentDark: '#0052a3',
  text: '#1a1a1a',
  textSecondary: '#666666',
  cardBg: '#ffffff',
  borderColor: '#e0e0e0',
  success: '#00b366',
  danger: '#cc0000',
  warning: '#ff9900'
};

/**
 * Create a volume progress chart for an exercise
 * @param {string} canvasId - ID of canvas element
 * @param {string} exerciseName - Name of exercise
 * @param {Array} records - Array of exercise records
 * @returns {Chart} Chart.js chart instance
 */
function createVolumeChart(canvasId, exerciseName, records) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  const labels = records.map(r => formatDate(r.date));
  const volumes = records.map(r => calculateVolume(r));

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Total Volume (${exerciseName})`,
        data: volumes,
        borderColor: THEME.accent,
        backgroundColor: `rgba(0, 212, 255, 0.1)`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: THEME.accent,
        pointBorderColor: THEME.cardBg,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: THEME.accentDark
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: THEME.text,
            font: { size: 14, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: THEME.cardBg,
          titleColor: THEME.accent,
          bodyColor: THEME.text,
          borderColor: THEME.border,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: function(context) {
              return `Volume: ${context.parsed.y.toFixed(0)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: THEME.borderColor,
            drawBorder: false
          },
          ticks: {
            color: THEME.textSecondary,
            font: { size: 12 }
          }
        },
        y: {
          grid: {
            color: THEME.borderColor,
            drawBorder: false
          },
          ticks: {
            color: THEME.textSecondary,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

/**
 * Create a 1RM progress chart for an exercise
 * @param {string} canvasId - ID of canvas element
 * @param {string} exerciseName - Name of exercise
 * @param {Array} records - Array of exercise records
 * @returns {Chart} Chart.js chart instance
 */
function create1RMChart(canvasId, exerciseName, records) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  // Calculate best 1RM for each session
  const labels = records.map(r => formatDate(r.date));
  const orm1RMs = records.map(r => {
    let best = 0;
    r.sets.forEach(set => {
      const orm = calculate1RM(set.weight, set.reps);
      if (orm > best) best = orm;
    });
    return best;
  });

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Estimated 1RM (${exerciseName})`,
        data: orm1RMs,
        borderColor: THEME.warning,
        backgroundColor: `rgba(255, 170, 0, 0.1)`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: THEME.warning,
        pointBorderColor: THEME.cardBg,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: THEME.accentDark
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: THEME.text,
            font: { size: 14, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: THEME.cardBg,
          titleColor: THEME.warning,
          bodyColor: THEME.text,
          borderColor: THEME.border,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: function(context) {
              return `Est. 1RM: ${context.parsed.y.toFixed(1)} kg`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: THEME.borderColor,
            drawBorder: false
          },
          ticks: {
            color: THEME.textSecondary,
            font: { size: 12 }
          }
        },
        y: {
          grid: {
            color: THEME.borderColor,
            drawBorder: false
          },
          ticks: {
            color: THEME.textSecondary,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

/**
 * Create a bar chart comparing weekly volume
 * @param {string} canvasId - ID of canvas element
 * @param {Array} weeklyData - Array of { week, volume }
 * @returns {Chart} Chart.js chart instance
 */
function createWeeklyVolumeChart(canvasId, weeklyData) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  const labels = weeklyData.map(w => w.week);
  const volumes = weeklyData.map(w => w.volume);
  const colors = volumes.map((v, i) =>
    i === volumes.length - 1 ? THEME.accent : THEME.accentDark
  );

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weekly Volume',
        data: volumes,
        backgroundColor: colors,
        borderColor: THEME.borderColor,
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      plugins: {
        legend: {
          labels: {
            color: THEME.text,
            font: { size: 14, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: THEME.cardBg,
          titleColor: THEME.accent,
          bodyColor: THEME.text,
          borderColor: THEME.border,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: function(context) {
              return `Volume: ${context.parsed.y.toFixed(0)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: THEME.textSecondary,
            font: { size: 12 }
          }
        },
        y: {
          grid: {
            color: THEME.borderColor,
            drawBorder: false
          },
          ticks: {
            color: THEME.textSecondary,
            font: { size: 12 }
          }
        }
      }
    }
  });
}
