const API_URL = 'https://your-backend-name.onrender.com';
const rateTable = document.querySelector('#rateTable tbody');

// Load all entries from backend
async function loadEntries() {
  const res = await fetch(`${API_URL}/entries`);
  const data = await res.json();
  data.forEach(renderRow);
}

// Render one row with hearts
function renderRow(entry) {
  const tr = document.createElement('tr');
  const time = new Date(entry.date).toLocaleString();

  const heartSpan = generateHeartRating(entry.id, entry.hearts || 0);

  tr.innerHTML = `
    <td>${time}</td>
    <td>${entry.meal}</td>
    <td>${entry.food}</td>
    <td>${entry.quantity}</td>
    <td class="hearts" data-id="${entry.id}">${heartSpan}</td>
  `;

  rateTable.appendChild(tr);
}

// Create clickable heart elements
function generateHeartRating(entryId, currentRating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const selected = i <= currentRating ? 'selected' : '';
    html += `<span data-heart="${i}" class="${selected}">&#10084;</span>`; // ❤️
  }
  return html;
}

// Click handler for hearts
rateTable.addEventListener('click', async (e) => {
  if (e.target.tagName === 'SPAN') {
    const span = e.target;
    const hearts = parseInt(span.getAttribute('data-heart'));
    const row = span.closest('td');
    const id = parseInt(row.getAttribute('data-id'));

    await fetch(`${API_URL}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hearts })
    });

    // Update heart display
    const newHTML = generateHeartRating(id, hearts);
    row.innerHTML = newHTML;
  }
});

loadEntries();
