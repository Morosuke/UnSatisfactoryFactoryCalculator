import React from 'react';
import ReactDOM from 'react-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import App from './components/App';
import * as serviceWorker from './serviceWorker';

const theme = createMuiTheme({
    palette: {
        // primary: {
        //     //     background: {
        //     //         default: '#303030',
        //     //         paper: '#424242'
        //     //     },
        //     // main: '#7289da', // discord blurple
        // },
        // secondary: {
        //     // main: '#61DAFB', // react blue
        // },
        text: {
            primary: '#E0E0E0',
        },
        type: 'dark'
    },
    typography: {
        useNextVariants: true
    }
});

ReactDOM.render(
    <React.StrictMode>
        <MuiThemeProvider theme={ theme }>
            <App />
        </MuiThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
