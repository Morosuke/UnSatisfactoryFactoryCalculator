import Recipe from './Recipe';
import ResourceRecipe from './ResourceRecipe';

export { default as Recipe } from './Recipe';
export { default as ResourceRecipe } from './ResourceRecipe';

export const getRecipes = (data, items) => {
    const recipes = new Map();
    for (const d of data.resources) {
        const item = items.get(d.key_name);
        recipes.set(d.key_name, new ResourceRecipe(item, d.category));
    }
    for (const d of data.recipes) {
        recipes.set(d.key_name, Recipe.makeRecipe(data, items, d));
    }
    for (const [itemKey, item] of items) {
        if (item.recipes.length === 0) {
            recipes.set(itemKey, new ResourceRecipe(item, null));
        }
    }
    return recipes;
};
