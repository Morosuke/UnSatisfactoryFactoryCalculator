import Ingredient from '../Ingredient';

import { Rational } from '../rational';

class Recipe {
    // constructor(key, name, category, time, ingredients, product, byproduct) {
    constructor(key, name, category, time, ingredients, product) {
        this.key = key;
        this.name = name;
        this.category = category;
        this.time = time;
        this.ingredients = ingredients;
        for (const ing of ingredients) {
            ing.item.addUse(this);
        }
        this.product = product;
        product.item.addRecipe(this);
        // this.byproduct = byproduct
        // byproduct.item.addByproduct(this)
    }

    gives(item) {
        if (this.product.item === item) {
            return this.product.amount;
        }
        return null;
    }

    // byproduct(item) {
    //    if (this.byproduct.item === item) {
    //        return this.byproduct.amount
    //    }
    //    return null
    // }
    iconPath() {
        return this.product.item.iconPath();
    }

    static makeRecipe(items, d) {
        const time = Rational.fromFloat(d.time);
        const [item_key, amount] = d.product;
        const [byproduct_key, byproduct_amount] = d.byproduct;
        const item = items.get(item_key);
        const byproduct_item = items.get(byproduct_key);
        const product = new Ingredient(item, Rational.fromFloat(amount));
        const byproduct = new Ingredient(byproduct_item, Rational.fromFloat(byproduct_amount));
        const ingredients = [];
        for (const [item_key, amount] of d.ingredients) {
            const item = items.get(item_key);
            ingredients.push(new Ingredient(item, Rational.fromFloat(amount)));
        }
        //    return new Recipe(d.key_name, d.name, d.category, time, ingredients, product, byproduct)
        return new Recipe(d.key_name, d.name, d.category, time, ingredients, product);
    }
}

export default Recipe;
