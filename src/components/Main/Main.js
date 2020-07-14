import React from 'react';

import PropTypes from 'prop-types';

const Main = props => (
    <main className={ props.classes.Main }>
        { props.children }
    </main>
);

Main.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    classes: PropTypes.object.isRequired
};

export default React.memo(Main);
