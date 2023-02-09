import React, { Component }                         from 'react'
import { BrowserRouter, Routes, Route, Navigate}    from 'react-router-dom';
import Home                                         from './pages/home';
import ProductList                                  from './pages/product-list';
import Header                                       from './components/header';

export default class App extends Component {
  state={
    logged: false,
    userType: 'standard', // standard || office || gaming || editVideo
    showChangeTypeForm : false,
  }

  setLogged = (param) => {
    this.setState({logged:param});
  }   
  setUserType = (param) => {
    this.setState({userType: param});
  }
  setShowChangeTypeForm = (param) => {
    this.setState({showChangeTypeForm: param});
  }

  render() {
    return (
      <div className="app">
        {/* <Header AppState={this.state} setLogged={this.setLogged} setUserType={this.setUserType} userType={this.state.userType}/> */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home AppState={this.state} setLogged={this.setLogged} setUserType={this.setUserType} setShowChangeTypeForm={this.setShowChangeTypeForm}/>} />
            <Route path="/product-list/:productParam" element={<ProductList AppState={this.state} setLogged={this.setLogged} setUserType={this.setUserType} setShowChangeTypeForm={this.setShowChangeTypeForm}/>} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}