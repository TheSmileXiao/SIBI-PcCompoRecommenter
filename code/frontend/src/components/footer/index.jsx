import "./index.css";
import React, { Component } from "react";

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer row">
        <div className="col-xs-12 center-xs middle-xs footer-block">
          <p className="footer-text">
            ©2023 YX PC Recommender, LLC. All rights reserved.
          </p>
        </div>
        <div className="col-xs-12 col-sm-6 center-xs middle-xs footer-block">
          <p className="footer-text">Correo: xiyang02@estudiantes.unileon.es</p>
        </div>
        <div className="col-xs-12 col-sm-6 center-xs middle-xs footer-block">
          <p className="footer-text">Teléfono: 123456789</p>
        </div>
      </footer>
    );
  }
}
