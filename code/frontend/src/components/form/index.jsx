import React, { Component } from "react";
import FormControl from '@mui/material/FormControl';
import TextField from "@mui/material/TextField";
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import _get from 'lodash/get';
import axios from "axios";

import "./index.css";
export default class Form extends Component {
  
  state={
    registerForm: false,
    userTypeAux: '',
  }

  setUserTypeAux = (param) => {
    this.setState({userTypeAux: param});
  }

  register = () => {
    const that = this;
    this.setState({registerForm: false});

    axios.post('/api/query',{
      query: `MATCH (u:User {username:'${this.props.HeaderState.username}'}) return u`
    })
    .then(function(res){
       const user = _get(res,"data[0]._fields[0].properties",undefined);
       if(user == undefined){
        axios.post('/api/query',{
          query: `MERGE (u:User {username:'${that.props.HeaderState.username}', password:'${that.props.HeaderState.password}', userType:'${that.state.userTypeAux}'}) return u`
        })
        .catch(function (error) {
          console.log('query error in frontend');
        });
       }
       else {
        alert('User already exists');
       }
    })
  }

  login = () => {
    const that = this;
    this.props.setShowLogin(false);
    this.setState({registerForm: false});
    axios.post('/api/query',{
      query: `MATCH (u:User {username:'${this.props.HeaderState.username}', password:'${this.props.HeaderState.password}'}) return u`
    })
    .then(function(res){
      const user = _get(res,"data[0]._fields[0].properties",undefined);
      if(user == undefined){
        alert('No estás registrada');
      }else{
        that.props.setLogged(true);
        const userType = _get(user,"userType",'standard')
        that.props.setUserType(userType);
      }
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
  }

  changeType = () => {
    const that = this;
    this.setState({showChangeTypeForm: false});

    axios.post('/api/query',{
      query: `MATCH (u:User {username:'${that.props.HeaderState.username}', password:'${that.props.HeaderState.password}'}) SET u.userType='${this.state.userTypeAux}' RETURN u`
    })
    .then(function(res){
      const user = _get(res,"data[0]._fields[0].properties",undefined);
      if(user == undefined){
        alert('Query error');
      }else{
        const userType = _get(user,"userType",'standard')
        that.props.setUserType(userType);
      }
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    this.props.setShowChangeTypeForm(false);
  }


  render() {
    return (
    <>
      <div className="overlay" onClick={()=>{this.props.setShowLogin(false) || this.props.setShowChangeTypeForm(false)}}></div>
      <div className="login-background row center-xs middle-xs">
        {(!this.state.registerForm && !this.props.AppState.showChangeTypeForm) &&
          <div className="login-container">
            <div className="closer" onClick={()=>this.props.setShowLogin(false)}>X</div>
            <h2>Iniciar</h2>
            <TextField className="login-item" id="outlined-basic" label="Username" variant="outlined" onBlur={(e) => this.props.setUsername(e.target.value)}/>
            <TextField className="login-item" id="outlined-basic" label="Password" variant="outlined" onBlur={(e) => this.props.setPassword(e.target.value)}/>
            <Button className="button login-item" variant="contained" onClick={() => this.login()}>Iniciar sesión</Button>
            <div className="register login-item" onClick={()=>{this.setState({registerForm: true})}}>Registra ahora</div>
          </div>
        }
        
        {(this.state.registerForm && !this.props.AppState.showChangeTypeForm) &&
        <div className="login-container">
          <h2>Registrar</h2>
          <div className="closer" onClick={()=>this.props.setShowLogin(false)}>X</div>
          <TextField className="login-item" id="outlined-basic" label="Username" variant="outlined" onBlur={(e) => this.props.setUsername(e.target.value)}/>
          <TextField className="login-item" id="outlined-basic" label="Password" variant="outlined" onBlur={(e) => this.props.setPassword(e.target.value)}/>
            <FormControl className="login-item">
            <InputLabel id="demo-simple-select-label">uso del ordenador</InputLabel>
            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={this.state.userTypeAux} label="uso del ordenador" onChange={(e)=>this.setUserTypeAux(e.target.value)}>
              <MenuItem value="standard">Uso estandar</MenuItem>
              <MenuItem value="office">Trabajar en la oficina</MenuItem>
              <MenuItem value="gaming">Videojuegos</MenuItem>
              <MenuItem value="editVideo">Editar videos</MenuItem>
            </Select>
          </FormControl>
          <Button className="button login-item" variant="contained" onClick={() => this.register()}>Registrar</Button>
        </div>
        }

        { this.props.AppState.showChangeTypeForm && 
          <div className="login-container">
            <h2>Tipo de usuario</h2>
            <div className="closer" onClick={()=>this.props.setShowChangeTypeForm(false)}>X</div>
              <FormControl className="login-item">
              <InputLabel id="demo-simple-select-label">{this.props.AppState.userType}</InputLabel>
              <Select labelId="demo-simple-select-label" id="demo-simple-select" value={this.state.userTypeAux} label="uso del ordenador" onChange={(e)=>this.setUserTypeAux(e.target.value)}>
                <MenuItem value="standard">Uso estandar</MenuItem>
                <MenuItem value="office">Trabajar en la oficina</MenuItem>
                <MenuItem value="gaming">Videojuegos</MenuItem>
                <MenuItem value="editVideo">Editar videos</MenuItem>
              </Select>
            </FormControl>
            <Button className="button login-item" variant="contained" onClick={() => this.changeType()}>OK</Button>
          </div>
        }

      </div>
    </>
    );
  }
}
