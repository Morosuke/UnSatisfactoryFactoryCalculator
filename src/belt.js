import beltData from './data/belts.json';

import { Rational } from './rational';

export class Belt {
    constructor(key, name, rate) {
        this.key = key;
        this.name = name;
        this.rate = rate;
    }

    iconPath() {
        return `/images/${ this.name }.png`;
    }
}

export function getBelts() {
    const belts = new Map();
    for (const belt of beltData) {
        belts.set(belt.key_name, new Belt(
            belt.key_name,
            belt.name,
            Rational.fromFloat(belt.rate).div(Rational.fromFloat(60))
        ));
    }
    return belts;
}
