import React from 'react'
import { Route, Switch } from 'react-router-dom';
import HomePage from './Pages/HomePage'
import TableExample from './Pages/TableExample'
import BasicGrid from './Pages/BasicGrid';
import ContactForm from './Pages/ContactForm';
import EstablishmentRegistry from './Pages/Establishment/EstablishmentRegistry';
import EstablishmentList from './Pages/Establishment/EstablishmentList';
import MenuRegistry from './Pages/Establishment/MenuRegistry';
import MenuList from './Pages/Establishment/MenuList';
import Login from './Pages/User/Login';
import ShoppingCart from './Pages/Establishment/ShoppingCart';
import withAuthentication from './services/withAuthentication';
import Orders from './Pages/Establishment/Orders';

export default function Routes() {
  return (
      <div style={{ marginTop: "60px", padding: "20px" }}>
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route exact path='/table' component={TableExample} />
          <Route exact path='/grid' component={BasicGrid} />
          <Route exact path='/form' component={ContactForm} />
          <Route exact path='/establishment/registry' component={EstablishmentRegistry} />
          <Route exact path='/establishment/list' component={EstablishmentList} />
          <Route exact path='/establishment/menu/registry' component={MenuRegistry} />
          <Route exact path='/establishment/menu/list' component={MenuList} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/shopping-cart' component={withAuthentication(ShoppingCart)}/>
          <Route exact path='/orders' component={withAuthentication(Orders)}/>
        </Switch>
      </div>
  );  
}

