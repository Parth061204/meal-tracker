const API_URL = 'https://your-backend-name.onrender.com';

const mealType = document.getElementById('mealType');
const quantity = document.getElementById('quantity');
const customQty = document.getElementById('customQty');
const submitBtn = document.getElementById('submit');
const logTable = document.querySelector('#logTable tbody');

// 🔁 Load existing logs
// async function loadLogs() {
//   try {
//     const res = await fetch(`${API_URL}/entries`);
//     const data = await res.json();
//     data.forEach(renderRow);
//   } catch {
//     const local = JSON.parse(localStorage.getItem("mealLogs") || "[]");
//     local.forEach(renderRow);
//   }
// }

async function loadLogs() {
    try {
        const res = await fetch(`${API_URL}/entries`);
        const data = await res.json();
        logTable.innerHTML = ''; // Clear existing rows
        data.forEach(renderRow);
    } catch (err) {
        alert("Error loading meal logs from server.");
    }
}

// 🧾 Submit new entry
submitBtn.addEventListener('click', async () => {
    const meal = mealType.value;
    const qty = quantity.value === 'Others' ? customQty.value.trim() : quantity.value;

    if (!qty) {
        alert('Please enter a quantity');
        return;
    }

    // ✅ Collect multiple food items
    const foodItems = [];
    const foodSelects = document.querySelectorAll('.foodType');

    foodSelects.forEach(select => {
        const customInput = select.nextElementSibling;
        if (select.value === 'Others') {
            const custom = customInput.value.trim();
            if (custom) foodItems.push(custom);
        } else {
            foodItems.push(select.value);
        }
    });

    if (foodItems.length === 0) {
        alert('Please enter at least one food item!');
        return;
    }

    const entry = {
        meal,
        food: foodItems,
        quantity: qty,
        date: new Date().toISOString(),
        hearts: 0
    };

    try {
        const res = await fetch(`${API_URL}/entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        const saved = await res.json();
        renderRow(saved);
    } catch (err) {
        console.warn("Backend offline. Saving to localStorage.");

        const entries = JSON.parse(localStorage.getItem("mealLogs") || "[]");
        entries.push(entry);
        localStorage.setItem("mealLogs", JSON.stringify(entries));
        renderRow(entry);
    }

    // Reset form
    document.getElementById('foodListContainer').innerHTML = '';
    addFoodField();
    customQty.value = '';
});

// 🧱 Render row in table
function renderRow(log) {
    const tr = document.createElement('tr');
    const time = new Date(log.date).toLocaleString();
    const hearts = '❤️'.repeat(log.hearts || 0);

    tr.innerHTML = `
    <td>${time}</td>
    <td>${log.meal}</td>
    <td>${Array.isArray(log.food) ? log.food.join(', ') : log.food}</td>
    <td>${log.quantity}</td>
    <td>${hearts}</td>
  `;
    logTable.appendChild(tr);
}

// ➕ Add new food input field
function addFoodField() {
    const container = document.getElementById('foodListContainer');

    const div = document.createElement('div');
    div.classList.add('food-entry');

    div.innerHTML = `
    <select class="foodType" onchange="toggleCustomFood(this)">
      <option>Bhakhri</option>
      <option>Chapti</option>
      <option>Rotelo</option>
      <option>Milk</option>
      <option>Chai</option>
      <option>Others</option>
    </select>
    <input type="text" class="customFood hidden" placeholder="Custom food name" />
  `;

    container.appendChild(div);
}

// 🕹️ Show/hide custom food input
function toggleCustomFood(selectElem) {
    const input = selectElem.nextElementSibling;
    input.classList.toggle('hidden', selectElem.value !== 'Others');
}

// 🕹️ Show/hide custom quantity input
function toggleCustomQty(value) {
    customQty.classList.toggle('hidden', value !== 'Others');
}

// 🏁 Init: start with 1 food input and load logs
addFoodField();
loadLogs();
