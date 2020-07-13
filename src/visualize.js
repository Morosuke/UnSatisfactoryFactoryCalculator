import * as d3Base from 'd3';
import * as d3Sankey from 'd3-sankey';

import Ingredient from './ingredient';
import { toggleIgnoreHandler } from './events';
import { spec } from './factory';
import { Rational, zero, one } from './rational';

// FIXME: this is cludgey as hell
const d3 = {
    ...d3Base,
    ...d3Sankey
};

const iconSize = 48;
const nodePadding = 20;
const columnWidth = 150;
const maxNodeHeight = 175;

function makeGraph(totals, targets, ignore) {
    const outputs = [];
    const rates = new Map();
    for (const target of targets) {
        let rate = rates.get(target.item);
        if (rate === undefined) {
            rate = zero;
        }
        rate = rate.add(target.getRate());
        rates.set(target.item, rate);
    }
    for (const [item, rate] of rates) {
        const ing = new Ingredient(item, rate);
        outputs.push(ing);
    }
    const nodes = [{
        name: 'output',
        ingredients: outputs,
        building: null,
        count: zero,
        rate: null,
        ignore: false,
    }];
    const nodeMap = new Map();
    nodeMap.set('output', nodes[0]);

    for (const [recipe, rate] of totals.rates) {
        const building = spec.getBuilding(recipe);
        const count = spec.getCount(recipe, rate);
        const node = {
            name: recipe.name,
            ingredients: recipe.ingredients,
            recipe: recipe,
            building: building,
            count: count,
            rate: rate,
            ignore: ignore.has(recipe),
        };
        nodes.push(node);
        nodeMap.set(recipe.name, node);
    }

    const links = [];
    for (const node of nodes) {
        if (!node.ignore) {
            for (const ing of node.ingredients) {
                let rate;
                if (node.name === 'output') {
                    rate = ing.amount;
                } else {
                    rate = totals.rates.get(node.recipe).mul(ing.amount);
                }
                for (const subRecipe of ing.item.recipes) {
                    if (totals.rates.has(subRecipe)) {
                        const link = {
                            source: nodeMap.get(subRecipe.name),
                            target: node,
                            value: rate.toFloat(),
                            rate: rate,
                        };
                        const belts = [];
                        const beltCountExact = spec.getBeltCount(rate);
                        const beltCount = beltCountExact.toFloat();
                        for (let j = one; j.less(beltCountExact); j = j.add(one)) {
                            const i = j.toFloat();
                            belts.push({ link, i, beltCount });
                        }
                        link.belts = belts;
                        links.push(link);
                    }
                }
            }
        }
    }
    return { links, nodes };
}

function recipeValue(recipe, rate, ignore) {
    let inputValue = zero;
    if (!ignore.has(recipe)) {
        for (const ing of recipe.ingredients) {
            inputValue = inputValue.add(rate.mul(ing.amount));
        }
    }
    const outputValue = rate.mul(recipe.product.amount);
    if (inputValue.less(outputValue)) {
        return outputValue;
    }
    return inputValue;
}

function rankHeightEstimate(rank, valueFactor) {
    let total = nodePadding * (rank.length - 1);
    for (const value of rank) {
        total += value.mul(valueFactor).toFloat();
    }
    return total;
}

function getRateString(d) {
    return d.rate === null ? '' : `\u00d7 ${ spec.format.rate(d.rate) }/${ spec.format.rateName }`;
}

function getMachineCountString(d) {
    console.assert(!d.count.isZero(), "Items that aren't produced through machines can't have a machine count!");
    return `\u00d7 ${ spec.format.count(d.count) }`;
}

function getOverclockString(d) {
    console.assert(!d.count.isZero(), "Items that aren't produced through machines (machine count == 0) can't have an overclock value!");
    return `${ spec.getOverclock(d.recipe).mul(Rational.fromFloat(100)).toString() }%`;
}

// This is basically an educated guess, but seems to match whatever Chrome and
// Firefox do pretty well.
function beltPath(d) {
    const x0 = d.link.source.x1;
    const y0 = d.link.y0;
    const y0top = y0 - d.link.width / 2;
    const x1 = d.link.target.x0;
    const y1 = d.link.y1;
    const y1top = y1 - d.link.width / 2;
    const mid = (x1 - x0) / 2;
    const slope = (y1 - y0) / (x1 - x0);

    const dy = d.link.width / d.beltCount;
    const yOffset = d.i * dy;
    const y0belt = y0top + yOffset;
    const y1belt = y1top + yOffset;

    const midAdjust = (d.link.width / 2 - yOffset) * slope;
    const xControl = x0 + mid + midAdjust;
    return `M ${ x0 },${ y0belt } C ${ xControl },${ y0belt },${ xControl },${ y1belt },${ x1 },${ y1belt }`;
}

const color = d3.scaleOrdinal(d3.schemeCategory10);

function renderTotals(totals, targets, ignore) {
    const data = makeGraph(totals, targets, ignore);

    let maxRank = 0;
    const ranks = new Map();
    let largestValue = zero;
    for (const [recipe, rank] of totals.heights) {
        let rankList = ranks.get(rank);
        if (rankList === undefined) {
            rankList = [];
            ranks.set(rank, rankList);
        }
        if (rank > maxRank) {
            maxRank = rank;
        }
        const rate = totals.rates.get(recipe);
        const value = recipeValue(recipe, rate, ignore);
        if (largestValue.less(value)) {
            largestValue = value;
        }
        rankList.push(value);
    }
    if (largestValue.isZero()) {
        return;
    }
    const beltDensity = maxNodeHeight / spec.getBeltCount(largestValue).toFloat();
    // The width of the display is the number of ranks, times the width of each
    // rank, plus a small constant for the output node.
    let maxTextWidth = 0;
    const testSVG = d3.select('body').append('svg');
    for (const node of data.nodes) {
        let text = testSVG.append('text');
        if (node.count.isZero()) {
            text = text.text(getRateString(node));
        } else {
            text.append('tspan').attr('x', 0).text(getMachineCountString(node));
            text.append('tspan').attr('x', 0).text(getOverclockString(node));
        }
        const textWidth = text.node().getBBox().width;
        text.remove();
        if (textWidth > maxTextWidth) {
            maxTextWidth = textWidth;
        }
    }
    testSVG.remove();
    const nodeWidth = iconSize + maxTextWidth + 4;
    const width = maxRank * (nodeWidth + columnWidth) + nodeWidth;
    // The height of the display is normalized by the height of the tallest box
    // in the graph. We define it to be (approximately) maxNodeHeight pixels
    // high.
    const valueFactor = Rational.fromFloat(maxNodeHeight).div(largestValue);
    let largestEstimate = 0;
    for (const [rank, rankList] of ranks) {
        const estimate = rankHeightEstimate(rankList, valueFactor);
        if (estimate > largestEstimate) {
            largestEstimate = estimate;
        }
    }
    const height = largestEstimate;

    const svg = d3.select('svg#graph')
        .attr('viewBox', `0,0,${ width + 20 },${ height + 20 }`)
        .style('width', width + 20)
        .style('height', height + 20);

    svg.selectAll('g').remove();

    const sankey = d3.sankey()
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .nodeAlign(d3.sankeyRight)
        .extent([[10, 10], [width + 10, height + 10]]);
    const { nodes, links } = sankey(data);

    // Node rects
    const rects = svg.append('g')
        .classed('nodes', true)
        .selectAll('rect')
        .data(nodes)
        .join('g')
        .classed('node', true);

    rects.append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', d => d3.color(color(d.name)).darker());
    rects.filter(d => d.name !== 'output')
        .append('image')
        .classed('ignore', d => ignore.has(d.recipe))
        .attr('x', d => d.x0 + 2)
        .attr('y', d => d.y0 + (d.y1 - d.y0) / 2 - (iconSize / 2))
        .attr('height', iconSize)
        .attr('width', iconSize)
        .attr('xlink:href', d => d.recipe.iconPath());

    // For nodes without an associated machine, display the rate on a single line:
    rects.filter(d => d.count.isZero())
        .append('text')
        .attr('x', d => d.x0 + iconSize + 2)
        .attr('y', d => (d.y0 + d.y1) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .text(getRateString);

    // For nodes with an associated machine, display the machine count on one
    // line, and the overclock rate on the next line:
    const twoLineText = rects.filter(d => !d.count.isZero())
        .append('text')
        .attr('x', d => d.x0 + iconSize + 2)
        .attr('y', d => (d.y0 + d.y1) / 2)
        .attr('dy', '-0.15em') // (0.35em minus half a line's height (0.5em), maintaining vertical alignment)
        .attr('text-anchor', 'start');
    twoLineText.append('tspan')
        .text(getMachineCountString);
    twoLineText.append('tspan') // ("x" and "dy" are used to render the text on the next line)
        .attr('x', d => d.x0 + iconSize + 2)
        .attr('dy', '1em')
        .text(getOverclockString);

    // Link paths
    const link = svg.append('g')
        .classed('links', true)
        .selectAll('g')
        .data(links)
        .join('g');
    // .style("mix-blend-mode", "multiply")
    link.append('path')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.3)
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('stroke', d => color(d.source.name))
        .attr('stroke-width', d => Math.max(1, d.width));
    // Don't draw belts if we have less than three pixels per belt.
    if (beltDensity >= 3) {
        link.append('g')
            .selectAll('path')
            .data(d => d.belts)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.3)
            .attr('d', beltPath)
            .attr('stroke', d => color(d.link.source.name))
            .attr('stroke-width', 1);
    }
    link.append('title')
        .text(d => `${ d.source.name } \u2192 ${ d.target.name }\n${ spec.format.rate(d.rate) }`);
    link.append('text')
        .attr('x', d => d.source.x1 + 6)
        .attr('y', d => d.y0)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .text(d => `${ spec.format.rate(d.rate) }/${ spec.format.rateName }`);

    // Overlay transparent rect on top of each node, for click events.
    const rectElements = svg.selectAll('g.node').nodes();
    const overlayData = [];
    // Flash the graph tab to be visible, so that the graph is laid out and
    // the BBox is not empty.
    const graphTab = d3.select('#graph_tab');
    const origDisplay = d3.style(graphTab.node(), 'display');
    graphTab.style('display', 'block');
    for (let i = 0; i < nodes.length; i += 1) {
        const rect = rectElements[i].getBBox();
        const node = nodes[i];
        const recipe = node.recipe;
        if (recipe !== undefined) {
            overlayData.push({ rect, node, recipe });
        }
    }
    graphTab.style('display', origDisplay);
    svg.append('g')
        .classed('overlay', true)
        .selectAll('rect')
        .data(overlayData)
        .join('rect')
        .attr('stroke', 'none')
        .attr('fill', 'transparent')
        .attr('x', d => d.rect.x)
        .attr('y', d => d.rect.y)
        .attr('width', d => d.rect.width)
        .attr('height', d => d.rect.height)
        .on('click', toggleIgnoreHandler)
        .append('title')
        .text(d => d.node.name + (d.node.count.isZero() ? '' : `\n${ d.node.building.name } ${ getMachineCountString(d.node) }\n${ getOverclockString(d.node) }`));
}

export default renderTotals;
