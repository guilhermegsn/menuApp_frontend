import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './Pages/HomePage'
import TableExample from './Pages/TableExample'
import BasicGrid from './Pages/BasicGrid';
import ContactForm from './Pages/ContactForm';
import EstablishmentRegistry from './Pages/Registry/EstablishmentRegistry';
import EstablishmentList from './Pages/Registry/EstablishmentList';

export default function Routes() {

  return (
    <div style={{marginTop: "60px", padding: "20px  "}}>
      <Router>
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route exact path='/table' component={TableExample} />
          <Route exact path='/grid' component={BasicGrid} />
          <Route exact path='/form' component={ContactForm} />
          <Route exact path='/registry/establishment' component={EstablishmentRegistry} />
          <Route exact path='/registry/establishment/list' component={EstablishmentList} />
        </Switch>
      </Router>
    </div>
  )
}
