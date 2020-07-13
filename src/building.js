import { Rational } from './rational';

export class Building {
    constructor(key, name, category, power, max) {
        this.key = key;
        this.name = name;
        this.category = category;
        this.power = power;
        this.max = max;
    }

    getCount(spec, recipe, rate) {
        return rate.div(this.getRecipeRate(spec, recipe));
    }

    getRecipeRate(spec, recipe) {
        const overclock = spec.getOverclock(recipe);
        return recipe.time.reciprocate().mul(overclock);
    }

    iconPath() {
        return `/images/${ this.name }.png`;
    }
}

export class Miner extends Building {
    constructor(key, name, category, power, baseRate) {
        super(key, name, category, power, null);
        this.baseRate = baseRate;
    }

    getRecipeRate(spec, recipe) {
        const purity = spec.getResourcePurity(recipe);
        const overclock = spec.getOverclock(recipe);
        return this.baseRate.mul(purity.factor).mul(overclock);
    }
}

export function getBuildings(data) {
    const buildings = [];
    for (const d of data.buildings) {
        buildings.push(new Building(
            d.key_name,
            d.name,
            d.category,
            Rational.fromFloat(d.power),
            d.max,
        ));
    }
    for (const d of data.miners) {
        buildings.push(new Miner(
            d.key_name,
            d.name,
            d.category,
            Rational.fromFloat(d.power),
            Rational.fromFloat(d.base_rate).div(Rational.fromFloat(60)),
        ));
    }
    return buildings;
}
