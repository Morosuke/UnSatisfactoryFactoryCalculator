class Building {
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
        return `${ process.env.PUBLIC_URL }/images/${ this.name }.png`;
    }
}

export default Building;
