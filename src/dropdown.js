import * as d3 from 'd3';

const dropdownLocal = d3.local();

function toggleDropdown() {
    const dropdownNode = dropdownLocal.get(this);
    const classes = dropdownNode.classList;
    if (classes.contains('open')) {
        classes.remove('open');
    } else {
        const node = d3.select(dropdownNode);
        const selected = node.select('input:checked + label');
        node.select('.spacer')
            .style('width', selected.style('width'))
            .style('height', selected.style('height'));
        classes.add('open');
    }
}

// Appends a dropdown to the selection, and returns a selection over the div
// for the content of the dropdown.
export function makeDropdown(selector) {
    const d = selector.append('div')
        .classed('dropdownWrapper', true)
        .each(function () { dropdownLocal.set(this, this); });
    d.append('div')
        .classed('clicker', true)
        .on('click', toggleDropdown);
    const dropdownInner = d.append('div')
        .classed('dropdown', true)
        .on('click', toggleDropdown);
    d.append('div')
        .classed('spacer', true);
    return dropdownInner;
}

let inputId = 0;
let labelFor = 0;

// Appends a dropdown input to the selection.
//
// Args:
//   name: Should be unique to the dropdown.
//   checked: Should be true when a given input is the selected one.
//   callback: Called when the selected item is changed.
//
// Returns:
//   Selection with the input's label.
export function addInputs(selector, name, checked, callback) {
    selector.append('input')
        .on('change', (d, i, nodes) => {
            toggleDropdown.call(this);
            callback.call(this, d, i, nodes);
        })
        .attr('id', `input-${ inputId += 1 }`)
        .attr('name', name)
        .attr('type', 'radio')
        .property('checked', checked);
    const label = selector.append('label')
        .attr('for', `input-${ labelFor += 1 }`);
    return label;
}

// Wrapper around makeDropdown/addInputs to create an input for each item in
// data.
export function dropdown(selector, data, name, checked, callback) {
    const dd = makeDropdown(selector)
        .selectAll('div')
        .data(data)
        .join('div');
    return addInputs(dd, name, checked, callback);
}
