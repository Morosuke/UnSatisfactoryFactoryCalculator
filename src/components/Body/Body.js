import React from 'react';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import {
    changeCountPrecision, changeRatePrecision, clickTab
} from '../../events';
import init from '../../init';

// TODO: convert to stylized components
import './Body.css';

class Body extends React.PureComponent {
    handlers = {
        changeCountPrecision,
        changeRatePrecision,
        clickTab,
        init,
        // plusHandler
    }

    componentDidMount() {
        this.handlers.init();
    }

    render() {
        return (
            <div>
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
                    <Typography>
                        This calculator is based on the original Satisfactory Calculator by Kirk McDonald, which can be found
                        <Link href='https://github.com/KirkMcDonald/satisfactory-calculator'> on Github</Link>.
                    </Typography>
                    <Typography>
                        As the original has fallen behind, we have taken the opportunity to perform a major overhaul to the application
                        with the goals of making it easier to maintain and providing a visual facelift.
                    </Typography>
                    <Typography>
                        Just like every factory, this is a work-in-progress. Please excuse our dust.
                    </Typography>
                </div>
            </div>
        );
    }
}

export default Body;
