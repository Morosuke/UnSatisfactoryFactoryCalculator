import React from 'react';
import {
    BrowserRouter, Route, Switch
} from 'react-router-dom';

import TargetDrawer from '../../TargetDrawer';
import Main from '../Main';
import Body from '../Body';
// import ROUTES from '../../constants/routes';

class Router extends React.PureComponent {
    render() {
        return (
            <BrowserRouter>
                <Main>
                    <TargetDrawer />
                    <Switch>
                        { /* <Route exact path={ ROUTES.LANDING } render={ () => <Redirect to={ ROUTES.SIGN_IN } { ...this.props } /> } /> */ }
                        { /* <Route path={ ROUTES.SIGN_IN } render={ () => <SignIn { ...this.props } /> } /> */ }
                        <Route component={ Body } path='*' />
                        { /* <Route path='*' render={ () => <Redirect to={ ROUTES.SIGN_IN } { ...this.props } /> } /> */ }
                    </Switch>
                </Main>
            </BrowserRouter>
        );
    }
}

export default Router;
