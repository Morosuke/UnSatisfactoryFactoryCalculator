import { select } from 'd3';

import {
    DEFAULT_RATE, DEFAULT_RATE_PRECISION, DEFAULT_COUNT_PRECISION, longRateNames
} from './align';
import { dropdown } from './dropdown';
import { DEFAULT_TAB, clickTab } from './events';
import { spec, resourcePurities, DEFAULT_BELT } from './factory';
import { Rational } from './rational';

// There are several things going on with this control flow. Settings should
// work like this:
// 1) Settings are parsed from the URL fragment into the settings Map.
// 2) Each setting's `render` function is called.
// 3) If the setting is not present in the map, a default value is used.
// 4) The setting is applied.
// 5) The setting's GUI is placed into a consistent state.
// Remember to add the setting to fragment.js, too!

// tab

function renderTab(settings) {
    let tabName = DEFAULT_TAB;
    if (settings.has('tab')) {
        tabName = settings.get('tab');
    }
    clickTab(tabName);
}

// build targets

function renderTargets(settings) {
    spec.buildTargets = [];
    select('#targets li.target').remove();

    const targetSetting = settings.get('items');
    if (targetSetting !== undefined && targetSetting !== '') {
        const targets = targetSetting.split(',');
        for (const targetString of targets) {
            const parts = targetString.split(':');
            const itemKey = parts[0];
            const target = spec.addTarget(itemKey);
            const type = parts[1];
            if (type === 'f') {
                target.setBuildings(parts[2]);
            } else if (type === 'r') {
                target.setRate(parts[2]);
            } else {
                throw new Error('unknown target type');
            }
        }
    } else {
        spec.addTarget();
    }
}

// ignore

function renderIgnore(settings) {
    spec.ignore.clear();
    // UI will be rendered later, as part of the solution.
    const ignoreSetting = settings.get('ignore');
    if (ignoreSetting !== undefined && ignoreSetting !== '') {
        const ignore = ignoreSetting.split(',');
        for (const recipeKey of ignore) {
            const recipe = spec.recipes.get(recipeKey);
            spec.ignore.add(recipe);
        }
    }
}

// overclock

function renderOverclock(settings) {
    spec.overclock.clear();
    // UI will be rendered later, as part of the solution.
    const overclockSetting = settings.get('overclock');
    if (overclockSetting !== undefined && overclockSetting !== '') {
        const overclock = overclockSetting.split(',');
        for (const pair of overclock) {
            const [recipeKey, percentString] = pair.split(':');
            const recipe = spec.recipes.get(recipeKey);
            const percent = Rational.fromString(percentString).div(Rational.fromFloat(100));
            spec.setOverclock(recipe, percent);
        }
    }
}

// display rate

function rateHandler() {
    spec.format.setDisplayRate(this.value);
    spec.updateSolution();
}

function renderRateOptions(settings) {
    let rateName = DEFAULT_RATE;
    if (settings.has('rate')) {
        rateName = settings.get('rate');
    }
    spec.format.setDisplayRate(rateName);
    const rates = [];
    // TODO: fix this
    // eslint-disable-next-line
    for (const [rateName, longRateName] of longRateNames) {
        rates.push({ rateName, longRateName });
    }
    const form = select('#display_rate');
    form.selectAll('*').remove();
    const rateOption = form.selectAll('span')
        .data(rates)
        .join('span');
    rateOption.append('input')
        .attr('id', d => `${ d.rateName }_rate`)
        .attr('type', 'radio')
        .attr('name', 'rate')
        .attr('value', d => d.rateName)
        .attr('checked', d => (d.rateName === rateName ? '' : null))
        .on('change', rateHandler);
    rateOption.append('label')
        .attr('for', d => `${ d.rateName }_rate`)
        .text(d => `items/${ d.longRateName }`);
    rateOption.append('br');
}

// precisions

function renderPrecisions(settings) {
    spec.format.ratePrecision = DEFAULT_RATE_PRECISION;
    if (settings.has('rp')) {
        spec.format.ratePrecision = Number(settings.get('rp'));
    }
    select('#rprec').attr('value', spec.format.ratePrecision);
    spec.format.countPrecision = DEFAULT_COUNT_PRECISION;
    if (settings.has('cp')) {
        spec.format.countPrecision = Number(settings.get('cp'));
    }
    select('#cprec').attr('value', spec.format.countPrecision);
}

// belt

function beltHandler(belt) {
    spec.belt = belt;
    spec.updateSolution();
}

function renderBelts(settings) {
    let beltKey = DEFAULT_BELT;
    if (settings.has('belt')) {
        beltKey = settings.get('belt');
    }
    spec.belt = spec.belts.get(beltKey);

    const belts = [];
    // TODO: fix this
    // eslint-disable-next-line
    for (const [beltKey, belt] of spec.belts) {
        belts.push(belt);
    }
    const form = select('#belt_selector');
    form.selectAll('*').remove();
    const beltOption = form.selectAll('span')
        .data(belts)
        .join('span');
    beltOption.append('input')
        .attr('id', d => `belt.${ d.key }`)
        .attr('type', 'radio')
        .attr('name', 'belt')
        .attr('value', d => d.key)
        .attr('checked', d => (d === spec.belt ? '' : null))
        .on('change', beltHandler);
    beltOption.append('label')
        .attr('for', d => `belt.${ d.key }`)
        .append('img')
        .classed('icon', true)
        .attr('src', d => d.iconPath())
        .attr('width', 32)
        .attr('height', 32)
        .attr('title', d => d.name);
}

// alternate recipes

function changeAltRecipe(recipe) {
    spec.setRecipe(recipe);
    spec.updateSolution();
}

function renderIngredient(ingSpan) {
    ingSpan.classed('ingredient', true)
        .attr('title', d => d.item.name)
        .append('img')
        .classed('icon', true)
        .attr('src', d => d.item.iconPath());
    ingSpan.append('span')
        .classed('count', true)
        .text(d => spec.format.count(d.amount));
}

function renderAltRecipes(settings) {
    spec.altRecipes = new Map();
    if (settings.has('alt')) {
        const alt = settings.get('alt').split(',');
        for (const recipeKey of alt) {
            const recipe = spec.recipes.get(recipeKey);
            spec.setRecipe(recipe);
        }
    }

    const items = [];
    for (const tier of spec.itemTiers) {
        for (const item of tier) {
            if (item.recipes.length > 1) {
                items.push(item);
            }
        }
    }

    const div = select('#alt_recipe_settings');
    div.selectAll('*').remove();

    const dropdowns = div.selectAll('div')
        .data(items)
        .enter().append('div');
    const recipeLabel = dropdown(
        dropdowns,
        d => d.recipes,
        d => `altrecipe-${ d.product.item.key }`,
        d => spec.getRecipe(d.product.item) === d,
        changeAltRecipe,
    );

    const productSpan = recipeLabel.append('span')
        .selectAll('span')
        .data(d => [d.product])
        .join('span');
    renderIngredient(productSpan);
    recipeLabel.append('span')
        .classed('arrow', true)
        .text('\u21d0');
    const ingredientSpan = recipeLabel.append('span')
        .selectAll('span')
        .data(d => d.ingredients)
        .join('span');
    renderIngredient(ingredientSpan);
}

// miners

function mineHandler(d) {
    spec.setMiner(d.recipe, d.miner, d.purity);
    spec.updateSolution();
}

function renderResources(settings) {
    spec.initMinerSettings();
    if (settings.has('miners')) {
        const miners = settings.get('miners').split(',');
        for (const minerString of miners) {
            const [recipeKey, minerKey, purityKey] = minerString.split(':');
            const recipe = spec.recipes.get(recipeKey);
            const miner = spec.miners.get(minerKey);
            const purity = resourcePurities[Number(purityKey)];
            spec.setMiner(recipe, miner, purity);
        }
    }

    const div = select('#resource_settings');
    div.selectAll('*').remove();
    const resources = [];
    for (const [recipe, { miner, purity }] of spec.minerSettings) {
        const minerDefs = spec.buildings.get(recipe.category);
        const purities = [];
        for (const purityDef of resourcePurities) {
            const miners = [];
            for (const minerDef of spec.buildings.get(recipe.category)) {
                const selected = miner === minerDef && purity === purityDef;
                miners.push({
                    recipe: recipe,
                    purity: purityDef,
                    miner: minerDef,
                    selected: selected,
                    id: `miner.${ recipe.key }.${ purityDef.key }.${ minerDef.key }`
                });
            }
            purities.push({ miners, purityDef });
        }
        resources.push({ recipe, purities, minerDefs });
    }
    const resourceTable = div.selectAll('table')
        .data(resources)
        .join('table')
        .classed('resource', true);
    const header = resourceTable.append('tr');
    header.append('th')
        .append('img')
        .classed('icon', true)
        .attr('src', d => d.recipe.iconPath())
        .attr('width', 32)
        .attr('height', 32)
        .attr('title', d => d.recipe.name);
    header.selectAll('th')
        .filter((d, i) => i > 0)
        .data(d => d.minerDefs)
        .join('th')
        .append('img')
        .classed('icon', true)
        .attr('src', d => d.iconPath())
        .attr('width', 32)
        .attr('height', 32)
        .attr('title', d => d.name);
    const purityRow = resourceTable.selectAll('tr')
        .filter((d, i) => i > 0)
        .data(d => d.purities)
        .join('tr');
    purityRow.append('td')
        .text(d => d.purityDef.name);
    const cell = purityRow.selectAll('td')
        .filter((d, i) => i > 0)
        .data(d => d.miners)
        .join('td');
    cell.append('input')
        .attr('id', d => d.id)
        .attr('type', 'radio')
        .attr('name', d => d.recipe.key)
        .attr('checked', d => (d.selected ? '' : null))
        .on('change', mineHandler);
    cell.append('label')
        .attr('for', d => d.id)
        .append('svg')
        .attr('viewBox', '0,0,32,32')
        .style('width', 32)
        .style('height', 32)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 32)
        .attr('height', 32)
        .attr('rx', 4)
        .attr('ry', 4);
}

export default function renderSettings(settings) {
    renderTargets(settings);
    renderIgnore(settings);
    renderOverclock(settings);
    renderRateOptions(settings);
    renderPrecisions(settings);
    renderBelts(settings);
    renderAltRecipes(settings);
    renderResources(settings);
    renderTab(settings);
}
