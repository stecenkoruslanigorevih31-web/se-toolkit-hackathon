async function generateMotivation() {
  const btn = document.getElementById('generate-btn');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error-msg');
  const motivationText = document.getElementById('motivation-text');

  btn.disabled = true;
  loadingDiv.style.display = 'flex';
  errorDiv.style.display = 'none';

  try {
    const response = await fetch('/api/generate-motivation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    motivationText.textContent = data.motivation;
  } catch (error) {
    console.error('Error:', error);
    errorDiv.textContent = 'Ошибка при генерации текста. Пожалуйста, проверьте API ключ и попробуйте снова.';
    errorDiv.style.display = 'block';
  } finally {
    btn.disabled = false;
    loadingDiv.style.display = 'none';
  }
}
