// import * as d3 from 'd3';

import { getBelts } from './belt';
import { getBuildings } from './buildings';
import { getItems } from './Item';
import { getRecipes } from './recipes';
import { loadSettings } from './fragment';
import renderSettings from './settings';
import { spec } from './factory';

function loadData(settings) {
    // d3.json('./data/data.json')
    //     .then(data => {
    const items = getItems();
    const recipes = getRecipes(items);
    const buildings = getBuildings();
    const belts = getBelts();
    spec.setData(items, recipes, buildings, belts);

    renderSettings(settings);

    spec.updateSolution();
    // });
}

function init() {
    const settings = loadSettings(window.location.hash);
    loadData(settings);
}

export default init;
