import { DEFAULT_RATE, DEFAULT_RATE_PRECISION, DEFAULT_COUNT_PRECISION } from './align';
import { DEFAULT_TAB, currentTab } from './events';
import { spec, DEFAULT_PURITY, DEFAULT_BELT } from './factory';
import { Rational } from './rational';

export function formatSettings() {
    let settings = '';
    if (currentTab !== DEFAULT_TAB) {
        settings += `tab=${ currentTab }&`;
    }
    if (spec.format.rateName !== DEFAULT_RATE) {
        settings += `rate=${ spec.format.rateName }&`;
    }
    if (spec.format.ratePrecision !== DEFAULT_RATE_PRECISION) {
        settings += `rp=${ spec.format.ratePrecision }&`;
    }
    if (spec.format.countPrecision !== DEFAULT_COUNT_PRECISION) {
        settings += `cp=${ spec.format.countPrecision }&`;
    }
    if (spec.belt.key !== DEFAULT_BELT) {
        settings += `belt=${ spec.belt.key }&`;
    }

    settings += 'items=';
    const targetStrings = [];
    for (const target of spec.buildTargets) {
        let targetString = '';
        if (target.changedBuilding) {
            targetString = `${ target.itemKey }:f:${ target.buildingInput.value }`;
        } else {
            targetString = `${ target.itemKey }:r:${ target.rate.mul(spec.format.rateFactor).toString() }`;
        }
        targetStrings.push(targetString);
    }
    settings += targetStrings.join(',');

    const ignore = [];
    for (const recipe of spec.ignore) {
        ignore.push(recipe.key);
    }
    if (ignore.length > 0) {
        settings += `&ignore=${ ignore.join(',') }`;
    }

    const overclock = [];
    for (const [recipe, factor] of spec.overclock) {
        const s = factor.mul(Rational.fromFloat(100)).toString();
        overclock.push(`${ recipe.key }:${ s }`);
    }
    if (overclock.length > 0) {
        settings += `&overclock=${ overclock.join(',') }`;
    }

    const alt = [];
    // TODO: fix this
    // eslint-disable-next-line
    for (const [item, recipe] of spec.altRecipes) {
        alt.push(recipe.key);
    }
    if (alt.length > 0) {
        settings += `&alt=${ alt.join(',') }`;
    }

    const minerStrings = [];
    for (const [recipe, { miner, purity }] of spec.minerSettings) {
        const miners = spec.buildings.get(recipe.category);
        const defaultMiner = miners[0];
        if (miner !== defaultMiner || purity !== DEFAULT_PURITY) {
            const s = `${ recipe.key }:${ miner.key }:${ purity.key }`;
            minerStrings.push(s);
        }
    }
    if (minerStrings.length > 0) {
        settings += `&miners=${ minerStrings.join(',') }`;
    }

    return settings;
}

export function loadSettings(fragment) {
    const settings = new Map();
    const subFragment = fragment.substr(1);
    const pairs = subFragment.split('&');
    for (const pair of pairs) {
        const i = pair.indexOf('=');
        if (i) {
            const name = pair.substr(0, i);
            const value = pair.substr(i + 1);
            settings.set(name, value);
        }
    }
    return settings;
}
