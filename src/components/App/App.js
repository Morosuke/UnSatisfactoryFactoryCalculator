import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';

import Router from '../Router';

class App extends React.PureComponent {
    render() {
        return (
            <React.Fragment>
                <CssBaseline />
                <Router />
            </React.Fragment>
        );
    }
}

export default App;
