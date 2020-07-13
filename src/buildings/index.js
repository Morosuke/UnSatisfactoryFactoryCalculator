import buildingData from '../data/buildings.json';
import minerData from '../data/miners.json';
import { Rational } from '../rational';

import Building from './building';
import Miner from './Miner';

export { default as Miner } from './Miner';

export const getBuildings = () => {
    const buildings = [];
    for (const d of buildingData) {
        buildings.push(new Building(
            d.key_name,
            d.name,
            d.category,
            Rational.fromFloat(d.power),
            d.max,
        ));
    }
    for (const d of minerData) {
        buildings.push(new Miner(
            d.key_name,
            d.name,
            d.category,
            Rational.fromFloat(d.power),
            Rational.fromFloat(d.base_rate).div(Rational.fromFloat(60)),
        ));
    }
    return buildings;
};
