import recipeData from '../data/recipes.json';
import resourceData from '../data/resources.json';

import Recipe from './Recipe';
import ResourceRecipe from './ResourceRecipe';

export { default as Recipe } from './Recipe';
export { default as ResourceRecipe } from './ResourceRecipe';

export const getRecipes = items => {
    const recipes = new Map();
    for (const d of resourceData) {
        const item = items.get(d.key_name);
        recipes.set(d.key_name, new ResourceRecipe(item, d.category));
    }
    for (const d of recipeData) {
        recipes.set(d.key_name, Recipe.makeRecipe(items, d));
    }
    for (const [itemKey, item] of items) {
        if (!item.recipes.length) {
            recipes.set(itemKey, new ResourceRecipe(item, null));
        }
    }
    return recipes;
};
