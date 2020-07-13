/* Copyright 2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */
import { Totals } from './totals';

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
        return `assets/images/${ this.name }.png`;
    }
}

export function getItems(data) {
    const items = new Map();
    for (const d of data.items) {
        items.set(d.key_name, new Item(d.key_name, d.name, d.tier));
    }
    return items;
}
