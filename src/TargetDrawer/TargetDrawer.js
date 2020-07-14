import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import PropTypes from 'prop-types';

import { plusHandler } from '../events';

class TargetDrawer extends React.PureComponent {
    render() {
        const { classes } = this.props;
        return (
            <Drawer
                classes={{
                    paper: classes.drawerPaper,
                }}
                className={ classes.drawer }
                id='navigation-drawer'
                variant='permanent'
            >
                <ul id='targets'>
                    <li id='plusButton'>
                        <button className='targetButton ui' onClick={ () => plusHandler() } title='Add new item.'>+</button>
                    </li>
                </ul>
            </Drawer>
        );
    }
}

TargetDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    // navDrawerControl: PropTypes.object.isRequired
};

export default TargetDrawer;
