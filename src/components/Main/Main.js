import React from 'react';

import {
    changeCountPrecision, changeRatePrecision, clickTab, plusHandler
} from '../../events';
import init from '../../init';

// TODO: convert to stylized components
import './Main.css';

class Main extends React.PureComponent {
    handlers = {
        changeCountPrecision,
        changeRatePrecision,
        clickTab,
        init,
        plusHandler
    }

    componentDidMount() {
        this.handlers.init();
    }

    render() {
        return (
            <React.Fragment>
                <ul id='targets'>
                    <li id='plusButton'>
                        <button className='targetButton ui' onClick={ () => this.handlers.plusHandler() } title='Add new item.'>+</button>
                    </li>
                </ul>
                <div className='tabs'>
                    <button className='tab_button' id='graph_button' onClick={ () => this.handlers.clickTab('graph') }>Visualize</button>
                    <button className='tab_button' id='totals_button' onClick={ () => this.handlers.clickTab('totals') }>Items</button>
                    <button className='tab_button' id='settings_button' onClick={ () => this.handlers.clickTab('settings') }>Settings</button>
                    <button className='tab_button' id='about_button' onClick={ () => this.handlers.clickTab('about') }>About</button>
                </div>
                <div className='tab graph' id='graph_tab'>
                    <svg id='graph'><g /></svg>
                </div>
                <div className='tab' id='totals_tab'>
                    <table className='power-shard-collapsed' id='totals'>
                        <thead><tr /></thead>
                        <tbody />
                        <tfoot>
                            <tr className='power'>
                                <td className='right-align label'><b>total average power: </b></td>
                                <td className='right-align pad'><tt /></td>
                            </tr>
                            <tr className='power'>
                                <td className='right-align label'><b>total peak power: </b></td>
                                <td className='right-align pad'><tt /></td>
                            </tr>
                            <tr className='power-shard'>
                                <td className='right-align label'><b>power shards needed: </b></td>
                                <td className='right-align pad'><tt /></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className='tab' id='settings_tab'>
                    <table id='settings'>
                        <tbody>

                            <tr className='setting-section'>
                                <td colSpan='2'>
                                    <span>Display</span><hr />
                                </td>
                            </tr>
                            <tr className='setting-row'>
                                <td className='setting-label top'>Display rates as:</td>
                                <td><form id='display_rate' /></td>
                            </tr>
                            <tr className='setting-row'>
                                <td className='setting-label'>Rate precision:</td>
                                <td>
                                    <input className='prec' id='rprec' min='0' onChange={ event => this.handlers.changeRatePrecision(event) } type='number' value='3' />
                                </td>
                            </tr>
                            <tr className='setting-row'>
                                <td className='setting-label'>Count precision:</td>
                                <td>
                                    <input className='prec' id='cprec' min='0' onChange={ event => this.handlers.changeCountPrecision(event) } type='number' value='1' />
                                </td>
                            </tr>
                            <tr className='setting-section'>
                                <td colSpan='2'>
                                    <span>Factory</span>
                                    <hr />
                                </td>
                            </tr>
                            <tr className='setting-row'>
                                <td className='setting-label'>Belt:</td>
                                <td><span id='belt_selector' /></td>
                            </tr>
                            <tr className='setting-section'>
                                <td colSpan='2'>
                                    <span>Recipes</span><hr />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan='2'>
                                    <div id='alt_recipe_settings' />
                                </td>
                            </tr>
                            <tr className='setting-section'>
                                <td colSpan='2'>
                                    <span>Resources</span>
                                    <hr />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan='2'>
                                    <div id='resource_settings' />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='tab' id='about_tab'>
                    <div className = 'about-content'>
                        This calculator is copyright 2019 Kirk McDonald. It is licensed under the Apache License 2.0, and its source may be <a href='https://github.com/KirkMcDonald/satisfactory-calculator'>found on github, here</a>.
                        This calculator is based on my <a href='https://kirkmcdonald.github.io/calc.html'>Factorio calculator</a>, and was created primarily to see what the project would look like if rewritten from scratch, applying lessons learned over the years spent developing the original.
                        Satisfactory is a simpler game for which to calculate ratios than Factorio. This simplicity means that it is easier for this calculator to support certain features that would be very difficult to add to the Factorio calculator, but which I have wanted to implement for a long time. This can be seen in the use of a <a href='https://en.wikipedia.org/wiki/Sankey_diagram'>Sankey diagram</a> in the visualizer, among other things.
                        If you wish to support the calculator, please consider donating to <a href='https://www.patreon.com/kirkmcdonald'>my Patreon campaign</a>. Any amount helps. And thank you!
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Main;
