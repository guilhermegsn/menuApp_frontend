import React from 'react'
import { Route, Switch } from 'react-router-dom';
// import HomePage from './Pages/HomePage'
// import TableExample from './Pages/TableExample'
// import BasicGrid from './Pages/BasicGrid';
// import ContactForm from './Pages/ContactForm';
// import EstablishmentRegistry from './Pages/Establishment/EstablishmentRegistry';
// import EstablishmentList from './Pages/Establishment/EstablishmentList';
// import MenuRegistry from './Pages/Establishment/MenuRegistry';
// import MenuList from './Pages/Establishment/MenuList';
import Login from './Pages/User/Login';
import ShoppingCart from './Pages/Establishment/ShoppingCart';
import ListMenu from './Pages/Establishment/ListMenu';
import ProductList from './Pages/Establishment/ProductList';

export default function Routes() {
  return (
    <div style={{ marginTop: "60px", padding: "20px" }}>
      <Switch>
        {/* <Route exact path='/' component={HomePage} />
        <Route exact path='/table' component={TableExample} />
        <Route exact path='/grid' component={BasicGrid} />
        <Route exact path='/form' component={ContactForm} />
        <Route exact path='/establishment/registry' component={EstablishmentRegistry} />
        <Route exact path='/establishment/list' component={EstablishmentList} />
        <Route exact path='/interativemenu/:estabId' component={MenuList} />
        <Route exact path='/interativemenu/:estabId/:clientId' component={MenuList} />
        <Route exact path='/establishment/menu/registry' component={MenuRegistry} />
        <Route exact path='/establishment/menu/list' component={MenuList} /> */}

        {/* <Route exact path='/menu/:estabId' component={ListMenu} /> */}

        {/* typeId: 1-QrCode 2-Mesa 3-Delivey 4-Nfc */}
        {/* <Route exact path='/menu/:estabId/:typeId/:clientId' component={ListMenu} />
        <Route exact path='/menu/:estabId/:typeId/:clientId/products/:menuId' component={ProductList} /> */}

        <Route exact path='/shopping-cart' component={ShoppingCart} />
        <Route exact path='/:estabId' component={ListMenu} />
        <Route exact path='/:estabId/:typeId/:clientId' component={ListMenu} />
        <Route exact path='/:estabId/:typeId/:clientId/products/:menuId' component={ProductList} />




        {/* Mesa e Delivery */}
        {/* <Route exact path='/static/:estabId/:typeId/:clientId' component={ListMenu} />
        <Route exact path='/static/:estabId/:typeId/:clientId/products/:menuId' component={ProductList} /> */}


        {/* <Route exact path='/menu/:estabId/:1/:qrcode/products/:menuId/:clientId' component={ProductList} />
        <Route exact path='/menu/:estabId/:2/:Mesa 12/products/:menuId' component={ProductList} />
        <Route exact path='/menu/:estabId/:3/:delivery/products/:menuId/:clientId' component={ProductList} />
        <Route exact path='/menu/:estabId/:4/:nfc/products/:menuId/:clientId' component={ProductList} />
         */}




        {/* <Route exact path='/menu/:estabId/products/:menuId' component={ProductList} /> */}

        <Route exact path='/login' component={Login} />
        {/* <Route exact path='/shopping-cart' component={ShoppingCart} /> */}
        <Route exact path='/shopping-cart/:estabId/:clientId' component={ShoppingCart} />
      </Switch>
    </div>
  );
}
