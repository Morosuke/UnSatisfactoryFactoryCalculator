// import * as d3 from 'd3';

import { getBelts } from './belt';
import { getBuildings } from './building';
import { getItems } from './item';
import { getRecipes } from './recipe';
import data from './data/data.json';
import { loadSettings } from './fragment';
import renderSettings from './settings';
import { spec } from './factory';

function loadData(settings) {
    // d3.json('./data/data.json')
    //     .then(data => {
    const items = getItems(data);
    const recipes = getRecipes(data, items);
    const buildings = getBuildings(data);
    const belts = getBelts(data);
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
