import React, { Fragment } from 'react';
import {
    BrowserRouter, Route, Switch
} from 'react-router-dom';

import Header from '../Header';
import Main from '../Main';
// import ROUTES from '../../constants/routes';

class Router extends React.PureComponent {
    render() {
        return (
            <BrowserRouter>
                <Fragment>
                    <Header />
                    <Switch>
                        { /* <Route exact path={ ROUTES.LANDING } render={ () => <Redirect to={ ROUTES.SIGN_IN } { ...this.props } /> } /> */ }
                        { /* <Route path={ ROUTES.SIGN_IN } render={ () => <SignIn { ...this.props } /> } /> */ }
                        <Route component={ Main } path='*' />
                        { /* <Route path='*' render={ () => <Redirect to={ ROUTES.SIGN_IN } { ...this.props } /> } /> */ }
                    </Switch>
                </Fragment>
            </BrowserRouter>
        );
    }
}

export default Router;
