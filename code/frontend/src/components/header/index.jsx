import React, { Component } from 'react'
import Button from '@mui/material/Button';
import Form from '../form';
import './index.css';

export default class Header extends Component {
  state = {
    showLogin:false,
    username: '',
    password: ''
  }

  setShowLogin=(param)=>{
    this.setState({showLogin: param});
  }
  setUsername=(param)=>{
    this.setState({username: param});
  }
  setPassword=(param)=>{
    this.setState({password: param});
  }

  render() {
    return (
      <>
        <header className="header">
        <img className="logo" src="https://user-images.githubusercontent.com/93156255/211200581-76e7b5cc-faa8-47a4-8e5b-f699352ff71c.png" alt="logo" onClick={() => this.props.goHome()}/>
          {!this.props.AppState.logged ?
            <Button className="button" variant="contained" onClick={() => this.setShowLogin(true)}>Iniciar sesión</Button>:
            <Button className="button" variant="contained" onClick={() => {this.props.setLogged(false) ; this.setShowLogin(false)}}>Salir</Button>
          }
        </header>
        {(this.state.showLogin || this.props.AppState.showChangeTypeForm) && <Form AppState={this.props.AppState} HeaderState={this.state} setUsername={this.setUsername} setPassword={this.setPassword} setLogged={this.props.setLogged} setUserType={this.props.setUserType} setShowLogin={this.setShowLogin} setShowChangeTypeForm={this.props.setShowChangeTypeForm}/>}
      </>
    );
  }
}