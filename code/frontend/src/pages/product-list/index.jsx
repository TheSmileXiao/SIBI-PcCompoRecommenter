import React, { Component } from 'react';
import axios from "axios";

import Header from '../../components/header';
import Footer from '../../components/footer';
import WithRouter from "../../components/withRouter";
import DehazeIcon from '@mui/icons-material/Dehaze';
import Pagination from "@mui/material/Pagination";
import Sidebar from "../../components/sidebar";
import ProductBox from "../../components/product/box";
import _isEqual from "lodash/isEqual";
import _map from "lodash/map";

import './index.css';
export class ProductList extends Component {
  state = {
    showSidebar   : false,
    productType   : '',
    page          : 1,
    productNumber : 0,
    data          : null
  }
  goHome = () => {this.props.router.navigate('/')};
  setShowSidebarNeg = () => {this.setState((prevState) => ({showSidebar: !prevState.showSidebar}))}

  componentDidMount(){
    let produtcParam = this.props.router.params.productParam;
    let productType = this.productTypeMap(produtcParam);
    this.setState({productType: productType});
  }
  componentDidUpdate(){
    let produtcParam = this.props.router.params.productParam;
    let productType = this.productTypeMap(produtcParam)
    if(this.state.productType !== productType){
      this.setState({productType: productType});
    }
    this.getProductAmount();
    this.getProductList();
  }

  getProductList = () => {
    const that = this;

    axios.post('/api/getProduct',{
      query: `MATCH (a:${this.state.productType}) return a order by a.rating_number DESC, a.rating DESC skip ${(this.state.page-1)*10} limit 10`
    })
    .then(function(res){
      if(!_isEqual(that.state.data, res.data)){
        that.setState({data: res.data});
      }
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
  }

  getProductAmount = () => {
    var that = this;
    axios.post('/api/getProductAmount',{
      query: `MATCH (a:${this.state.productType}) return COUNT(a)`
    })
    .then(function(res){
      if(that.state.productNumber !== res.data[0]){
        that.setState({productNumber: res.data[0]});
      }
    })
    .catch(function (error) {
      console.log("error in frontend: " + error);
    });
  }


  setPage = (event, value) => {
    if(this.state.page !== value){
      this.setState({page: value})
    }
  }

  productTypeMap(param) {
    switch (param){
      case 'Placa base' : return 'MotherBoard';
      case 'CPU' : return 'Cpu';
      case 'Tarjeta gráfica' : return 'GraphicCard';
      case 'RAM' : return 'Ram';
      case 'ROM' : return 'Rom';
      case 'Fuente de alimentación' : return 'Power';
      case 'Caja o torre' : return 'Cases';
    }
  }

  render() {
    let pageNumber = parseInt(this.state.productNumber/10, 10);
    if(pageNumber < this.state.productNumber/10){
      pageNumber += 1;
    }
    return (
      <>
      <Header AppState={this.props.AppState} setLogged={this.props.setLogged} setUserType={this.props.setUserType} setShowChangeTypeForm={this.props.setShowChangeTypeForm} goHome={this.goHome}/>
      <div className="home row">
        <DehazeIcon className={`dehazeIcon ${this.state.showSidebar && 'actived'}`} onClick={this.setShowSidebarNeg}/>
        {this.state.showSidebar && <Sidebar className="col-xs-5 col-sm-3 col-lg-2" AppState={this.props.AppState} setUserType={this.props.setUserType} setShowChangeTypeForm={this.props.setShowChangeTypeForm}/>}
        <div className={`product-list ${this.state.showSidebar ? `col-xs-7 col-sm-9 col-lg-10` : `col-xs-12 col-sm-12`} center-xs`}>
          <h1 className='title'>{this.props.router.params.productParam}</h1>
          <div className="product-list-container row">
            {_map(this.state.data, (product) => <ProductBox info={product} key={product.name}/>)}
          </div>
          <Pagination className="pagination" count={pageNumber} variant="outlined" color="primary" onChange={this.setPage}/>
        </div>
      </div>
      <Footer/>
      </>
    );
  }
}

export default WithRouter(ProductList);