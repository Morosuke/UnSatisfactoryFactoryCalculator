import Building from './building';

class Miner extends Building {
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

export default Miner;
