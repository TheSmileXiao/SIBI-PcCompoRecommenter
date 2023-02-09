import React, { Component } from "react";
import { Link } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import _map from "lodash/map";
import _get from "lodash/get";

import "./index.css";

export default class Sidebar extends Component {

  componentes = {
    placaBase : 'Placa base',
    cpu       : 'CPU',
    graphic   : 'Tarjeta gráfica',
    ram       : 'RAM',
    rom       : 'ROM',
    power     : 'Fuente de alimentación',
    cases     : 'Caja o torre'
  }

  render() {
    return (
      <div className={`${this.props.className} sidebar`}>
        <div className="title">
          <p>Componentes</p>
        </div>
        <div className="content">
          <MenuList id="composition-menu" aria-labelledby="composition-button" onKeyDown={this.prueba2}>
            {_map
            (this.componentes,(item, index) => 
              <Link key={item} to={`/product-list/${item}`} className="menu-link">
                <MenuItem className="menu-item">{item}</MenuItem>
              </Link>
            )
            }
            <div className="use-for">{}</div>
          </MenuList>
        </div>

        { this.props.AppState.logged && 
        <>
          <div className="title">
            <p>Tipo de usuario</p>
          </div>
          <div className='user-type' onClick={()=>this.props.setShowChangeTypeForm(true)}>{this.props.AppState.userType}</div>
        </>}
      </div>
    );
  }
}
