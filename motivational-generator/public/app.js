let selectedField = null;
let selectedMood = null;
let currentMotivation = null;
let history = [];
let favorites = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  loadFavorites();
});

// --- FIELD SELECTION ---
function selectField(btn) {
  document.querySelectorAll('[data-field]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedField = btn.dataset.field;
}

// --- MOOD SELECTION ---
function selectMood(btn) {
  document.querySelectorAll('[data-mood]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMood = btn.dataset.mood;
}

// --- GENERATE MOTIVATION ---
async function generateMotivation() {
  const btn = document.getElementById('generate-btn');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error-msg');
  const outputText = document.getElementById('output-text');
  const saveFavBtn = document.getElementById('save-fav-btn');

  if (!selectedField || !selectedMood) {
    errorDiv.textContent = 'Please select both a Field and a Mood before generating.';
    errorDiv.style.display = 'block';
    return;
  }

  btn.disabled = true;
  loadingDiv.style.display = 'flex';
  errorDiv.style.display = 'none';
  saveFavBtn.style.display = 'none';
  outputText.textContent = '';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: selectedField, mood: selectedMood })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    currentMotivation = data.motivation;
    outputText.textContent = currentMotivation.text;

    // Show save button
    saveFavBtn.style.display = 'inline-block';

    // Refresh history
    await loadHistory();
  } catch (error) {
    console.error('Error:', error);
    errorDiv.textContent = `Error: ${error.message}. Please try again.`;
    errorDiv.style.display = 'block';
  } finally {
    btn.disabled = false;
    loadingDiv.style.display = 'none';
  }
}

// --- SAVE TO FAVORITES ---
async function saveToFavorites() {
  if (!currentMotivation) return;

  const errorDiv = document.getElementById('error-msg');
  errorDiv.style.display = 'none';

  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: currentMotivation.text,
        field: currentMotivation.field,
        mood: currentMotivation.mood
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save to favorites');
    }

    await loadFavorites();
    console.log('✅ Saved to favorites');
  } catch (error) {
    console.error('Error:', error);
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = 'block';
  }
}

// --- LOAD HISTORY ---
async function loadHistory() {
  const historyList = document.getElementById('history-list');

  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error('Failed to load history');

    const data = await response.json();
    history = data.history;

    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-state">No history yet. Generate your first motivation!</p>';
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="history-item">
        <p class="item-text">"${item.text}"</p>
        <div class="item-meta">
          <span class="tag tag-field">${formatLabel(item.field)}</span>
          <span class="tag tag-mood">${formatLabel(item.mood)}</span>
          <span class="timestamp">${formatTime(item.createdAt)}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// --- CLEAR HISTORY ---
async function clearHistory() {
  try {
    const response = await fetch('/api/history', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear history');

    history = [];
    document.getElementById('history-list').innerHTML = '<p class="empty-state">No history yet. Generate your first motivation!</p>';
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// --- LOAD FAVORITES ---
async function loadFavorites() {
  const favList = document.getElementById('favorites-list');

  try {
    const response = await fetch('/api/favorites');
    if (!response.ok) throw new Error('Failed to load favorites');

    const data = await response.json();
    favorites = data.favorites;

    if (favorites.length === 0) {
      favList.innerHTML = '<p class="empty-state">Save your favorite quotes here to revisit them anytime.</p>';
      return;
    }

    favList.innerHTML = favorites.map(item => `
      <div class="fav-item">
        <p class="item-text">"${item.text}"</p>
        <div class="item-meta">
          <span class="tag tag-field">${formatLabel(item.field)}</span>
          <span class="tag tag-mood">${formatLabel(item.mood)}</span>
        </div>
        <button class="btn-remove" onclick="removeFavorite(${item.id})" aria-label="Remove from favorites">
          ↩️ Remove
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
}

// --- REMOVE FAVORITE ---
async function removeFavorite(id) {
  try {
    const response = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove favorite');

    await loadFavorites();
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

// --- HELPER FUNCTIONS ---
function formatLabel(key) {
  const labels = {
    sport: '🏋️ Sport & Fitness',
    study: '📚 Study & Learning',
    career: '💼 Career & Success',
    energizing: '⚡ Energizing',
    calm: '🧘 Calm',
    unstoppable: '🔥 Unstoppable'
  };
  return labels[key] || key;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
