/**
 * LocalStorage Management Module
 * Handles all localStorage operations with error handling
 */

const Storage = {
  RECIPES_KEY: 'recipes',

  /**
   * Get all recipes from localStorage
   * @returns {Array} Array of recipes
   */
  getRecipes() {
    try {
      const recipesJson = localStorage.getItem(this.RECIPES_KEY);
      if (!recipesJson) {
        return [];
      }
      const recipes = JSON.parse(recipesJson);
      if (!Array.isArray(recipes)) {
        console.error('Invalid recipes data format');
        return [];
      }
      return recipes;
    } catch (error) {
      console.error('Error reading recipes from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(this.RECIPES_KEY);
      return [];
    }
  },

  /**
   * Save recipes to localStorage
   * @param {Array} recipes - Array of recipes to save
   * @returns {boolean} Success status
   */
  saveRecipes(recipes) {
    try {
      if (!Array.isArray(recipes)) {
        console.error('Invalid recipes data: must be an array');
        return false;
      }
      localStorage.setItem(this.RECIPES_KEY, JSON.stringify(recipes));
      return true;
    } catch (error) {
      console.error('Error saving recipes to localStorage:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some recipes.');
      }
      return false;
    }
  },

  /**
   * Clear all recipes from localStorage
   */
  clearRecipes() {
    try {
      localStorage.removeItem(this.RECIPES_KEY);
    } catch (error) {
      console.error('Error clearing recipes from localStorage:', error);
    }
  },

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
};
