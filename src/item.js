import Totals from './totals';

export class Item {
    constructor(key, name, tier) {
        this.key = key;
        this.name = name;
        this.tier = tier;
        this.recipes = [];
        this.uses = [];
        // this.byproduct = []
    }

    addRecipe(recipe) {
        this.recipes.push(recipe);
    }

    // addByproduct(byproduct) {
    // this.byproduct.push(byproduct)
    // }
    addUse(recipe) {
        this.uses.push(recipe);
    }

    produce(spec, rate, ignore) {
        const totals = new Totals();
        const recipe = spec.getRecipe(this);
        const gives = recipe.gives(this);
        // let byproduct = recipe.byproduct(this)
        rate = rate.div(gives);
        totals.add(recipe, rate);
        totals.updateHeight(recipe, 0);
        if (ignore.has(recipe)) {
            return totals;
        }
        for (const ing of recipe.ingredients) {
            const subtotals = ing.item.produce(spec, rate.mul(ing.amount), ignore);
            totals.combine(subtotals);
        }
        return totals;
    }

    iconPath() {
        return `/images/${ this.name }.png`;
    }
}

export function getItems(data) {
    const items = new Map();
    for (const d of data.items) {
        items.set(d.key_name, new Item(d.key_name, d.name, d.tier));
    }
    return items;
}
