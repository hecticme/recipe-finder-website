// Seacrh input logic
const submitBtn = document.querySelector('#submit-btn');
const userInput = document.querySelector('#user-input');
const recipeLayout = document.querySelector('.recipe-layout');
const recipeModal = document.querySelector('.recipe-modal');
const overlay = document.querySelector('.overlay');

submitBtn.addEventListener('click', findRecipes);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault;
    submitBtn.click();
  }
});
// End of Search input logic

// Find recipes logic
async function findRecipes() {
  const input = userInput.value.trim();
  if (!input) {
    return;
  }
  const url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
  const res = await fetch(url + input);
  const recipes = await res.json();
  let result = '';
  if (recipes.meals) {
    recipes.meals.forEach((meal) => {
      result += `<div class="recipe-card" data-id="${meal.idMeal}">
        <img
          src="${meal.strMealThumb}"
          alt="${meal.strMeal}"
          class="recipe-card__img"
          draggable="false"
        />
        <div class="recipe-card__body">
          <p class="recipe-card__name">${meal.strMeal}</p>
        </div>
      </div>`;
    });
  } else {
    result += `<p class="not-found">Oops! We can't find the recipe you want. 😔<p>`;
  }
  recipeLayout.innerHTML = result;
}
// End of find recipes logic

// Open instruction details logic
recipeLayout.addEventListener('click', openInstruction);

function openInstruction(e) {
  e.preventDefault();
  const recipeId = e.target.parentElement.dataset.id;
  getInstruction(recipeId);
}

async function getInstruction(id) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  const res = await fetch(url);
  const recipes = await res.json();
  const meal = recipes.meals[0];
  // Declare ingredients
  const ingredientName = [];
  for (const property in meal) {
    if (property.startsWith('strIngredient') && meal[property]) {
      ingredientName.push(meal[property]);
    }
  }
  const ingredientMeasure = [];
  for (const property in meal) {
    if (property.startsWith('strMeasure') && meal[property]) {
      ingredientMeasure.push(meal[property]);
    }
  }
  const ingredientCombined = [];
  for (let i = 0; i < ingredientName.length; i++) {
    ingredientCombined.push(`${ingredientMeasure[i]} ${ingredientName[i]}`);
  }
  const ingredientList = ingredientCombined
    .map((ele) => `<li>${ele}</li>`)
    .join('');
  // Render instruction
  let instructionArray;
  const filterRegex = /.?STEP\s\d+/;
  if (meal.strInstructions.includes('STEP')) {
    // remove linebreak
    instructionArray = meal.strInstructions.replace(/(\r\n|\n|\r)/gm, '');
    instructionArray = instructionArray.split(filterRegex);
    instructionArray.splice(0, 1);
  } else {
    // remove linebreak
    instructionArray = meal.strInstructions.replace(/(\r\n|\n|\r)/gm, '');
    instructionArray = instructionArray.split(/\d*\.\)?\s?\(?/);
    instructionArray.splice(instructionArray.length - 1, 1);
  }
  const instructionList = instructionArray
    .filter((ele) => ele)
    .map((ele) => `<li>${ele}</li>`)
    .join('');
  // Render result
  const result = `<section class="recipe-modal__information-container">
        <div class="recipe-modal__close-btn">
          <i class="fa-solid fa-xmark"></i>
        </div>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-modal__img" />

        <div class="recipe-modal__body">
          <h2 class="recipe-modal__name">${meal.strMeal}</h2>
          <h3 class="recipe-modal__ingridient">Ingridient</h3>
          <ul class="recipe-modal__ingridient-list">
            ${ingredientList}
          </ul>
        </div>
      </section>
      <section class="recipe-modal__instruction-container">
        <ul class="recipe-modal__instruction-list">
          ${instructionList}
        </ul>
      </section>`;
  recipeModal.innerHTML = result;
  recipeModal.classList.add('show');
  overlay.classList.add('show');
}

// Close modal logic
function closeInstruction(e) {
  e.preventDefault();
  recipeModal.classList.remove('show');
  overlay.classList.remove('show');
}

recipeModal.addEventListener('click', (e) => {
  if (
    e.target.parentElement.classList.contains('recipe-modal__close-btn') ||
    e.target.classList.contains('recipe-modal__close-btn')
  ) {
    closeInstruction(e);
  }
});

overlay.addEventListener('click', closeInstruction);
// End of close modal logic
