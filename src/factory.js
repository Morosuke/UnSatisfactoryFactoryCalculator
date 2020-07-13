import * as d3 from 'd3';

import { Formatter } from './align';
import displayItems from './display';
import { formatSettings } from './fragment';
import {
    Rational, zero, half, one
} from './rational';
import BuildTarget from './target';
import Totals from './totals';
import renderTotals from './visualize';

const DEFAULT_ITEM_KEY = 'supercomputer';

const minerCategories = new Set(['mineral', 'oil', 'water']);

export const resourcePurities = [
    { key: '0', name: 'Impure', factor: half },
    { key: '1', name: 'Normal', factor: one },
    { key: '2', name: 'Pure', factor: Rational.fromFloat(2) },
];

export const DEFAULT_PURITY = resourcePurities[1];

export const DEFAULT_BELT = 'belt1';

class FactorySpecification {
    constructor() {
        // Game data definitions
        this.items = null;
        this.recipes = null;
        this.buildings = null;
        this.belts = null;

        this.itemTiers = [];

        this.buildTargets = [];

        // Map resource recipe to {miner, purity}
        this.miners = new Map();
        this.minerSettings = new Map();

        // Map recipe to overclock factor
        this.overclock = new Map();

        // Map item to recipe
        this.altRecipes = new Map();

        this.belt = null;

        this.ignore = new Set();

        this.format = new Formatter();
    }

    setData(items, recipes, buildings, belts) {
        this.items = items;
        const tierMap = new Map();
        for (const [itemKey, item] of items) {
            let tier = tierMap.get(item.tier);
            if (tier === undefined) {
                tier = [];
                tierMap.set(item.tier, tier);
            }
            tier.push(item);
        }
        this.itemTiers = [];
        for (const [tier, tierItems] of tierMap) {
            this.itemTiers.push(tierItems);
        }
        this.itemTiers.sort((a, b) => a[0].tier - b[0].tier);
        this.recipes = recipes;
        this.buildings = new Map();
        for (const building of buildings) {
            let category = this.buildings.get(building.category);
            if (category === undefined) {
                category = [];
                this.buildings.set(building.category, category);
            }
            category.push(building);
            if (minerCategories.has(building.category)) {
                this.miners.set(building.key, building);
            }
        }
        this.belts = belts;
        this.belt = belts.get(DEFAULT_BELT);
        this.initMinerSettings();
    }

    initMinerSettings() {
        this.minerSettings = new Map();
        for (const [recipeKey, recipe] of this.recipes) {
            if (minerCategories.has(recipe.category)) {
                const miners = this.buildings.get(recipe.category);
                // Default to miner mk1.
                const miner = miners[0];
                // Default to normal purity.
                const purity = DEFAULT_PURITY;
                this.minerSettings.set(recipe, { miner, purity });
            }
        }
    }

    getRecipe(item) {
        // TODO: Alternate recipes.
        const recipe = this.altRecipes.get(item);
        if (recipe === undefined) {
            return item.recipes[0];
        }
        return recipe;
    }

    setRecipe(recipe) {
        const item = recipe.product.item;
        if (recipe === item.recipes[0]) {
            this.altRecipes.delete(item);
        } else {
            this.altRecipes.set(item, recipe);
        }
    }

    getBuilding(recipe) {
        if (recipe.category === null) {
            return null;
        } if (this.minerSettings.has(recipe)) {
            return this.minerSettings.get(recipe).miner;
        }
        // NOTE: Only miners offer alternative buildings. May need to
        // revisit this if higher tiers of constructors are added.
        return this.buildings.get(recipe.category)[0];
    }

    getOverclock(recipe) {
        return this.overclock.get(recipe) || one;
    }

    setOverclock(recipe, overclock) {
        if (overclock.equal(one)) {
            this.overclock.delete(recipe);
        } else {
            this.overclock.set(recipe, overclock);
        }
    }

    // Returns the recipe-rate at which a single building can produce a recipe.
    // Returns null for recipes that do not have a building.
    getRecipeRate(recipe) {
        const building = this.getBuilding(recipe);
        if (building === null) {
            return null;
        }
        return building.getRecipeRate(this, recipe);
    }

    getResourcePurity(recipe) {
        return this.minerSettings.get(recipe).purity;
    }

    setMiner(recipe, miner, purity) {
        this.minerSettings.set(recipe, { miner, purity });
    }

    getCount(recipe, rate) {
        const building = this.getBuilding(recipe);
        if (building === null) {
            return zero;
        }
        return building.getCount(this, recipe, rate);
    }

    getBeltCount(rate) {
        return rate.div(this.belt.rate);
    }

    getPowerUsage(recipe, rate, itemCount) {
        const building = this.getBuilding(recipe);
        if (building === null || this.ignore.has(recipe)) {
            return { average: zero, peak: zero };
        }
        const count = this.getCount(recipe, rate);
        let average = building.power.mul(count);
        let peak = building.power.mul(count.ceil());
        const overclock = this.overclock.get(recipe);
        if (overclock !== undefined) {
            // The result of this exponent will typically be irrational, so
            // this approximation is a necessity. Because overclock is limited
            // to the range [0.01, 2.50], any imprecision introduced by this
            // approximation is minimal (and is probably less than is present
            // in the game itself).
            const overclockFactor = Rational.fromFloat(overclock.toFloat() ** 1.6);
            average = average.mul(overclockFactor);
            peak = peak.mul(overclockFactor);
        }
        return { average, peak };
    }

    addTarget(itemKey = DEFAULT_ITEM_KEY) {
        const item = this.items.get(itemKey);
        const target = new BuildTarget(this.buildTargets.length, itemKey, item, this.itemTiers);
        this.buildTargets.push(target);
        d3.select('#targets').insert(() => target.element, '#plusButton');
        return target;
    }

    removeTarget(target) {
        this.buildTargets.splice(target.index, 1);
        for (let i = target.index; i < this.buildTargets.length; i += 1) {
            this.buildTargets[i].index -= 1;
        }
        d3.select(target.element).remove();
    }

    toggleIgnore(recipe) {
        if (this.ignore.has(recipe)) {
            this.ignore.delete(recipe);
        } else {
            this.ignore.add(recipe);
        }
    }

    solve() {
        const totals = new Totals();
        for (const target of this.buildTargets) {
            const subtotals = target.item.produce(this, target.getRate(), this.ignore);
            totals.combine(subtotals);
        }
        return totals;
    }

    setHash = () => {
        window.location.hash = `#${ formatSettings() }`;
    }

    updateSolution() {
        const totals = this.solve();
        displayItems(this, totals, this.ignore);
        renderTotals(totals, this.buildTargets, this.ignore);
        this.setHash();
    }
}

export const spec = new FactorySpecification();
window.spec = spec;
