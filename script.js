/**
 * Unified App Logic - Storage, Recipes, Utils, and UI
 * Single consolidated file to replace all separate modules
 */

// ========== STORAGE ==========
const Storage = {
  RECIPES_KEY: 'recipes',

  getRecipes() {
    try {
      const data = localStorage.getItem(this.RECIPES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading storage:', e);
      localStorage.removeItem(this.RECIPES_KEY);
      return [];
    }
  },

  saveRecipes(recipes) {
    try {
      if (!Array.isArray(recipes)) return false;
      localStorage.setItem(this.RECIPES_KEY, JSON.stringify(recipes));
      return true;
    } catch (e) {
      console.error('Error saving to storage:', e);
      if (e.name === 'QuotaExceededError') {
        alert('Storage full. Delete some recipes.');
      }
      return false;
    }
  },

  isAvailable() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
};

// ========== RECIPES LOGIC ==========
const Recipes = {
  init() {
    if (!Storage.isAvailable()) {
      console.error('localStorage not available');
      return;
    }
    const existing = Storage.getRecipes();
    if (existing.length === 0) {
      Storage.saveRecipes(DEFAULT_RECIPES);
    }
  },

  getAll() {
    return Storage.getRecipes();
  },

  getById(id) {
    return this.getAll().find((r) => r.id === id) || null;
  },

  add(data) {
    const recipes = this.getAll();
    const recipe = { id: Date.now(), ...data };
    recipes.push(recipe);
    return Storage.saveRecipes(recipes) ? recipe : null;
  },

  update(id, data) {
    const recipes = this.getAll();
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    recipes[idx] = { ...recipes[idx], ...data, id };
    return Storage.saveRecipes(recipes) ? recipes[idx] : null;
  },

  delete(id) {
    const recipes = this.getAll().filter((r) => r.id !== id);
    return Storage.saveRecipes(recipes);
  },

  search(query) {
    if (!query) return this.getAll();
    const q = query.toLowerCase();
    return this.getAll().filter((r) => r.title.toLowerCase().includes(q));
  },

  filterByDifficulty(recipes, difficulty) {
    if (!difficulty || difficulty === 'all') return recipes;
    return recipes.filter((r) => r.difficulty === difficulty);
  },

  filterByTime(recipes, maxTime) {
    if (!maxTime) return recipes;
    return recipes.filter((r) => r.prepTime + r.cookTime <= maxTime);
  },

  filterByType(recipes, type) {
    if (!type || type === 'all') return recipes;
    return recipes.filter((r) => r.type === type);
  },
};

// ========== UTILITIES ==========
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getDifficultyBadge(difficulty) {
  const map = {
    easy: { text: 'Easy', class: 'difficulty-easy' },
    medium: { text: 'Medium', class: 'difficulty-medium' },
    hard: { text: 'Hard', class: 'difficulty-hard' },
  };
  const d = map[difficulty] || map.medium;
  return `<span class="difficulty-badge ${d.class}">${d.text}</span>`;
}

function getTypeBadge(type) {
  const map = {
    veg: { text: 'Veg', class: 'type-veg' },
    'non-veg': { text: 'Non-Veg', class: 'type-non-veg' },
  };
  const t = map[type] || map.veg;
  return `<span class="type-badge ${t.class}">${t.text}</span>`;
}

function isValidUrl(url) {
  if (!url || !url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function appendCacheBuster(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + '_cb=' + Date.now();
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function showFieldError(fieldId, msg) {
  const el = document.getElementById(fieldId + 'Error');
  if (el) el.textContent = msg;
}

function clearFieldError(fieldId) {
  const el = document.getElementById(fieldId + 'Error');
  if (el) el.textContent = '';
}

// ========== UI - RECIPE CARDS ==========
function createRecipeCard(recipe) {
  const time = recipe.prepTime + recipe.cookTime;
  const badge = getDifficultyBadge(recipe.difficulty);

  let svgContent;
  if (recipe.type === 'veg') {
    svgContent = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" fill="none" stroke="#00A651" stroke-width="2"/>
  <circle cx="12" cy="12" r="6" fill="#00A651"/>
</svg>
`;
  } else if (recipe.type === 'non-veg') {
    svgContent = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" fill="none" stroke="#FF0000" stroke-width="2"/>
  <circle cx="12" cy="12" r="6" fill="#FF0000"/>
</svg>
`;
  } else {
    svgContent = '';
  }

  const icon = svgContent
    ? `<div class="recipe-card-icon">${svgContent}</div>`
    : '';

  let img = '';
  if (recipe.imageUrl && recipe.imageUrl.trim()) {
    img = `<img src="${escapeHtml(recipe.imageUrl)}"
           alt="${escapeHtml(recipe.title)}" class="recipe-card-image">`;
  }

  return `
    <div class="recipe-card" onclick="showRecipeDetail(${recipe.id})">
      ${icon}
      ${img}
      <div class="recipe-card-content">
        <h3 class="recipe-card-title">${escapeHtml(recipe.title)}</h3>
        <p class="recipe-card-description">${escapeHtml(recipe.description)}</p>
        <div class="recipe-card-meta">
          <span class="recipe-card-time">⏱️ ${time} min</span>
          ${badge}
        </div>
      </div>
    </div>
  `;
}

function displayRecipes() {
  const search = document.getElementById('searchInput')?.value || '';
  const difficulty =
    document.getElementById('difficultyFilter')?.value || 'all';
  const maxTime = parseInt(
    document.getElementById('prepTimeFilter')?.value || 0
  );
  const type = window.currentTypeFilter || 'all';

  let filtered = Recipes.search(search);
  filtered = Recipes.filterByDifficulty(filtered, difficulty);
  filtered = Recipes.filterByTime(filtered, maxTime);
  filtered = Recipes.filterByType(filtered, type);

  const grid = document.getElementById('recipesGrid');
  const count = document.getElementById('recipeCount');
  const noRecipes = document.getElementById('noRecipes');

  if (count)
    count.textContent = `${filtered.length} recipe${
      filtered.length !== 1 ? 's' : ''
    } found`;

  if (filtered.length === 0) {
    if (grid) grid.innerHTML = '';
    if (noRecipes) noRecipes.style.display = 'block';
  } else {
    if (grid) grid.innerHTML = filtered.map(createRecipeCard).join('');
    if (noRecipes) noRecipes.style.display = 'none';
  }
}

// ========== FORM HANDLING ==========
function loadRecipeForEdit(id) {
  const recipe = Recipes.getById(id);
  if (!recipe) {
    alert('Recipe not found');
    showHomePage();
    return;
  }

  const title = document.getElementById('formTitle');
  if (title) title.textContent = 'Edit Recipe';

  document.getElementById('title').value = recipe.title || '';
  document.getElementById('description').value = recipe.description || '';
  document.getElementById('prepTime').value = recipe.prepTime || 0;
  document.getElementById('cookTime').value = recipe.cookTime || 0;
  document.getElementById('difficulty').value = recipe.difficulty || '';
  if (document.getElementById('type'))
    document.getElementById('type').value = recipe.type || '';
  document.getElementById('imageUrl').value = recipe.imageUrl || '';

  const ingContainer = document.getElementById('ingredientsContainer');
  ingContainer.innerHTML = '';
  (recipe.ingredients || []).forEach((ing) => addIngredient(ing));
  if (!recipe.ingredients || recipe.ingredients.length === 0) addIngredient();

  const stepsContainer = document.getElementById('stepsContainer');
  stepsContainer.innerHTML = '';
  (recipe.steps || []).forEach((step) => addStep(step));
  if (!recipe.steps || recipe.steps.length === 0) addStep();

  document.getElementById('recipeForm').dataset.recipeId = id;
}

function addIngredient(value = '') {
  const container = document.getElementById('ingredientsContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'ingredient-item';
  div.innerHTML = `
    <input type="text" class="ingredient-input" placeholder="e.g., 2 cups flour" value="${escapeHtml(
      value
    )}">
    <button type="button" class="btn-remove" onclick="removeIngredient(this)">×</button>
  `;
  container.appendChild(div);
}

function removeIngredient(btn) {
  const container = document.getElementById('ingredientsContainer');
  if (container && container.children.length > 1) {
    btn.parentElement.remove();
  } else {
    alert('At least one ingredient required');
  }
}

function addStep(value = '') {
  const container = document.getElementById('stepsContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'step-item';
  div.innerHTML = `
    <textarea class="step-input" rows="2" placeholder="Enter step">${escapeHtml(
      value
    )}</textarea>
    <button type="button" class="btn-remove" onclick="removeStep(this)">×</button>
  `;
  container.appendChild(div);
}

function removeStep(btn) {
  const container = document.getElementById('stepsContainer');
  if (container && container.children.length > 1) {
    btn.parentElement.remove();
  } else {
    alert('At least one step required');
  }
}

function getFormData() {
  const ingredients = Array.from(document.querySelectorAll('.ingredient-input'))
    .map((inp) => inp.value.trim())
    .filter((v) => v);

  const steps = Array.from(document.querySelectorAll('.step-input'))
    .map((ta) => ta.value.trim())
    .filter((v) => v);

  return {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    prepTime: parseInt(document.getElementById('prepTime').value) || 0,
    cookTime: parseInt(document.getElementById('cookTime').value) || 0,
    difficulty: document.getElementById('difficulty').value,
    type: document.getElementById('type')
      ? document.getElementById('type').value
      : '',
    imageUrl: document.getElementById('imageUrl').value.trim(),
    ingredients,
    steps,
  };
}

function validateForm() {
  const data = getFormData();
  let valid = true;

  if (!data.title || data.title.length < 3) {
    showFieldError('title', 'Title must be 3+ chars');
    valid = false;
  } else clearFieldError('title');

  if (!data.description || data.description.length < 10) {
    showFieldError('description', 'Description must be 10+ chars');
    valid = false;
  } else clearFieldError('description');

  if (
    !data.difficulty ||
    !['easy', 'medium', 'hard'].includes(data.difficulty)
  ) {
    showFieldError('difficulty', 'Select difficulty');
    valid = false;
  } else clearFieldError('difficulty');

  if (!data.type || !['veg', 'non-veg'].includes(data.type)) {
    showFieldError('type', 'Select type');
    valid = false;
  } else clearFieldError('type');

  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    showFieldError('imageUrl', 'Invalid URL');
    valid = false;
  } else clearFieldError('imageUrl');

  if (data.ingredients.length === 0) {
    showFieldError('ingredients', 'Add at least one ingredient');
    valid = false;
  } else clearFieldError('ingredients');

  if (data.steps.length === 0) {
    showFieldError('steps', 'Add at least one step');
    valid = false;
  } else clearFieldError('steps');

  return valid;
}

function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const data = getFormData();
  const recipeId = document.getElementById('recipeForm').dataset.recipeId;
  let result;

  if (recipeId) {
    result = Recipes.update(parseInt(recipeId), data);
    if (result) {
      alert('Recipe updated!');
      showRecipeDetail(recipeId);
      return;
    }
  } else {
    result = Recipes.add(data);
    if (result) {
      alert('Recipe added!');
      showHomePage();
      return;
    }
  }
  alert('Operation failed');
}

// ========== PAGE NAVIGATION ==========
function showHomePage() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('addEditPage').style.display = 'none';
  document.getElementById('detailPage').style.display = 'none';
  displayRecipes();

  // Remove back-to-top button when leaving detail page
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.remove();
  }
}

function showAddEditPage(id = null) {
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('addEditPage').style.display = 'block';
  document.getElementById('detailPage').style.display = 'none';

  const form = document.getElementById('recipeForm');
  delete form.dataset.recipeId;
  const title = document.getElementById('formTitle');
  if (title) title.textContent = 'Add New Recipe';

  form.reset();
  document.getElementById('ingredientsContainer').innerHTML = '';
  document.getElementById('stepsContainer').innerHTML = '';
  addIngredient();
  addStep();

  // default to veg for new recipe form
  if (!id && document.getElementById('type')) {
    document.getElementById('type').value = 'veg';
  }

  if (id) loadRecipeForEdit(id);
}

function showRecipeDetail(id) {
  const recipe = Recipes.getById(id);
  if (!recipe) {
    alert('Recipe not found');
    showHomePage();
    return;
  }

  document.getElementById('homePage').style.display = 'none';
  document.getElementById('addEditPage').style.display = 'none';
  document.getElementById('detailPage').style.display = 'block';

  const detail = document.getElementById('recipeDetail');
  const badge = getDifficultyBadge(recipe.difficulty);
  const typeBadge = getTypeBadge(recipe.type);
  const totalTime = recipe.prepTime + recipe.cookTime;

  let img = '';
  if (recipe.imageUrl && recipe.imageUrl.trim()) {
    img = `<img src="${escapeHtml(appendCacheBuster(recipe.imageUrl))}" 
           alt="${escapeHtml(recipe.title)}" class="recipe-image" 
           onerror="this.style.display='none'">`;
  }

  const editSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
  const deleteSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

  detail.innerHTML = `
    <div class="recipe-detail-header">
      <a href="#" onclick="showHomePage(); return false;" class="back-link">← Back to Recipes</a>
      <div class="recipe-actions">
        <a href="#" onclick="showAddEditPage(${
          recipe.id
        }); return false;" class="btn-icon-edit" title="Edit">${editSvg}</a>
        <button onclick="deleteRecipe(${
          recipe.id
        })" class="btn-icon-delete" title="Delete">${deleteSvg}</button>
      </div>
    </div>

    <div class="recipe-intro-row">
      ${img}
      <div class="recipe-intro-text">
        <h1>${escapeHtml(recipe.title)}</h1>
        <p class="recipe-description">${escapeHtml(recipe.description)}</p>
        <div class="recipe-meta">
          <div class="meta-item">
            <span class="meta-label">Prep Time:</span>
            <span class="meta-value">${recipe.prepTime} min</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Cook Time:</span>
            <span class="meta-value">${recipe.cookTime} min</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Total Time:</span>
            <span class="meta-value">${totalTime} min</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Difficulty:</span>
            <span class="meta-value">${badge}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Type:</span>
            <span class="meta-value">${typeBadge}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="recipe-section">
      <h2>Ingredients</h2>
      <ul class="ingredients-list">
        ${recipe.ingredients
          .map((ing) => `<li>${escapeHtml(ing)}</li>`)
          .join('')}
      </ul>
    </div>

    <div class="recipe-section">
      <h2>Instructions</h2>
      <ol class="steps-list">
        ${recipe.steps
          .map(
            (step, i) => `
          <li>
            <span class="step-number">${i + 1}</span>
            <span class="step-text">${escapeHtml(step)}</span>
          </li>
        `
          )
          .join('')}
      </ol>
    </div>
  `;

  // Add back-to-top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.onclick = scrollToTop;
  document.body.appendChild(backToTopBtn);
}

function deleteRecipe(id) {
  if (confirm('Delete this recipe?')) {
    Recipes.delete(id);
    showHomePage();
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterByType(type) {
  window.currentTypeFilter = type;
  updateTypeFilterToggle(type);
  displayRecipes();
}

function handleTypeToggle() {
  const toggle = document.getElementById('typeToggle');
  if (toggle.checked) {
    filterByType('non-veg');
  } else {
    filterByType('veg');
  }
}

function updateTypeFilterToggle(type) {
  const toggle = document.getElementById('typeToggle');
  const slider = document.querySelector('.toggle-slider');
  const clearBtn = document.getElementById('clearTypeFilterBtn');

  if (type === 'all') {
    toggle.checked = false;
    if (slider) slider.classList.remove('active-red', 'active-green');
    if (clearBtn) clearBtn.classList.remove('active');
  } else if (type === 'non-veg') {
    toggle.checked = true;
    if (slider) {
      slider.classList.remove('active-green');
      slider.classList.add('active-red');
    }
    if (clearBtn) clearBtn.classList.add('active');
  } else if (type === 'veg') {
    toggle.checked = false;
    if (slider) {
      slider.classList.remove('active-red');
      slider.classList.add('active-green');
    }
    if (clearBtn) clearBtn.classList.add('active');
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
  Recipes.init();
  window.currentTypeFilter = 'all';

  const searchInput = document.getElementById('searchInput');
  const diffFilter = document.getElementById('difficultyFilter');
  const timeFilter = document.getElementById('prepTimeFilter');

  if (searchInput)
    searchInput.addEventListener('input', debounce(displayRecipes, 300));
  if (diffFilter) diffFilter.addEventListener('change', displayRecipes);
  if (timeFilter) timeFilter.addEventListener('change', displayRecipes);

  const form = document.getElementById('recipeForm');
  if (form) form.addEventListener('submit', handleFormSubmit);

  // Show/hide back-to-top button on scroll
  window.addEventListener('scroll', function () {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
      if (window.scrollY > 200) {
        backToTopBtn.style.display = 'block';
      } else {
        backToTopBtn.style.display = 'none';
      }
    }
  });

  showHomePage();
});
