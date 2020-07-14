import Ingredient from '../Ingredient';
import Recipe from './Recipe';
import { one, zero } from '../rational';

class ResourceRecipe extends Recipe {
    constructor(item, category) {
        // super(item.key, item.name, category, zero, [], new Ingredient(item, one), new Ingredient(item, one))
        super(item.key, item.name, category, zero, [], new Ingredient(item, one));
    }
}

export default ResourceRecipe;
