import React, { Component } from "react";
import axios from "axios";

import TextField from "@mui/material/TextField";
import DehazeIcon from '@mui/icons-material/Dehaze';
import Button from '@mui/material/Button';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ProductBox from "../../components/product/box";
import WithRouter from "../../components/withRouter";
import Sidebar from "../../components/sidebar";
import _get from "lodash/get";
import _map from "lodash/map";
import _isEqual from "lodash/isEqual";
import _orderBy from "lodash/orderBy";
import _includes from "lodash/includes";
import _concat from "lodash/concat";

import './index.css'
export class Home extends Component {
  
  state = {
    showSidebar : false,
    price: 500,
    pricePart:{},
    cpuList: null,
    graphicList: null,
    ramList: null,
    ssdList: null,
    hddList: null,
    powerList: null,
    casesList: null,
    motherBoardList: null,
    socket: null,
    ready: false,
    data: null,
    showMore: null,
    priceTotal : 0,
  }
  goHome = () => {this.props.router.navigate('/')};
  setPrice = (price) => {this.setState({price: price})};
  setShowSidebarNeg = () => {this.setState((prevState) => ({showSidebar: !prevState.showSidebar}))};
  build = async () => {
    await this.setPricePart();
    await this.setCpuListByScore();
    await this.setGraphicListByScore();
    await this.setRamListByScore();
    await this.setSSDListByScore();
    await this.setHDDListByScore();
    await this.setPowerListByScore();
    await this.setCasesListByScore();
    await this.setMotherBoardListByScore();
    await this.setState({ready: true});
  };
  setPricePart = () => {
    if(this.state.price <= 450){
      this.setState({pricePart: {cpu: 5, graphic: 0, ram: 2, ssd:2, hdd: 0, power:1.5, motherBoard: 2.5, cases: 1.5, total: 14.5}});
    }else {
      switch(this.props.AppState.userType){ //standard || office || gaming || editVideo
        case 'standard':
          if(this.state.price <= 800){
            this.setState({pricePart: {cpu: 4, graphic: 0, ram: 2, ssd:1, hdd: 1, power:1, motherBoard: 2, cases: 1, total: 12}});
          }else {
            this.setState({pricePart: {cpu: 4, graphic: 3, ram: 2, ssd:1.5, hdd: 0, power:1, motherBoard: 2.5, cases: 1, total: 15}});
          }
          break;
        case 'office':
          if(this.state.price <= 800){
            this.setState({pricePart: {cpu: 4, graphic: 0, ram: 2, ssd:1, hdd: 1, power:1, motherBoard: 2, cases: 1, total: 12}});
          }else {
            this.setState({pricePart: {cpu: 4, graphic: 2, ram: 2, ssd:1, hdd: 1, power:1, motherBoard: 2, cases: 1, total: 14}});
          }
          break;
        case 'gaming':
          if(this.state.price <= 800){
            this.setState({pricePart: {cpu: 4, graphic: 4, ram: 1.5, ssd:1.5, hdd: 0, power:1, motherBoard: 2, cases: 1, total: 15}});
          }else {
            this.setState({pricePart: {cpu: 3, graphic: 5, ram: 1, ssd:2, hdd: 1, power:1, motherBoard: 2, cases: 1, total: 16}});
          }
          break;
        case 'editVideo':
          if(this.state.price <= 800){
            this.setState({pricePart: {cpu: 4, graphic: 4, ram: 1, ssd:1, hdd: 1, power:1, motherBoard: 2, cases: 1, total: 15}});
          }else {
            this.setState({pricePart: {cpu: 3, graphic: 5, ram: 1, ssd:1.5, hdd: 1.5, power:1, motherBoard: 2, cases: 1, total: 16}});
          }
          break;
      }
    }
  }

  setCpuListByScore = async() => {
    try{
      const that = this;
      const topSpeedCpu = await this.findTopSpeedCpu();
      const topBoostSpeedCpu = await this.findTopBoostSpeedCpu();
      const mostCoreCpu = await this.findMostCoreCpu();
      
      const topSpeed = topSpeedCpu.core_clock_GHz;
      const mostCore = mostCoreCpu.core_count;
      const topBoostSpeed = topBoostSpeedCpu.boost_clock_GHz;
      let speed = 0;
      let boostSpeed = 0;
      let core_count = 0;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      let query = '';

      if(this.state.pricePart.graphic === 0){
        query = `MATCH (a:Cpu) WHERE a.price < ${this.state.price*this.state.pricePart.cpu/this.state.pricePart.total} AND a.integrated_graphics <> '' return a order by a.core_clock_GHz DESC limit 50`;
      }else{
        query = `MATCH (a:Cpu) WHERE a.price < ${this.state.price*this.state.pricePart.cpu/this.state.pricePart.total} return a order by a.core_clock_GHz DESC limit 50`;
      }
      await axios.post('/api/getProduct',{
        query: query
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          speed = res.data[i].core_clock_GHz;
          core_count = res.data[i].core_count;
          boostSpeed = _get(res.data[i], 'boost_clock_GHz', speed);
          //calcular score
          scoreBase = ((speed/topSpeed + boostSpeed/topBoostSpeed*0.5 + core_count/mostCore*0.5) *100);
          if(res.data[i].rating_number > 200){
            incremento = (Math.pow(200, 1/Math.E)/10) * (res.data[i].rating*2/5-1);
          }else {
            incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/10) * (res.data[i].rating*2/5-1);
          }
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({socket: lista[0].socket});
        that.setState({cpuList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
   }

   findMostCoreCpu = () => {
    const that = this;
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:Cpu) return a order by a.core_count DESC limit 1`
    })
    .then(function(res){
      return res.data[0];
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  findTopSpeedCpu = () => {
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:Cpu) WHERE a.core_clock_GHz IS NOT NULL return a order by a.core_clock_GHz DESC limit 1`
    })
    .then(function(res){
      return res.data[0];
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  findTopBoostSpeedCpu = () => {
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:Cpu) WHERE a.boost_clock_GHz IS NOT NULL return a order by a.boost_clock_GHz DESC limit 1`
    })
    .then(function(res){
      return res.data[0];
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  setGraphicListByScore = async () => {
    try{
      const that = this;
      const topSpeedGraphic = await this.findTopSpeedGraphic();
      const topBoostSpeedGraphic = await this.findTopBoostSpeedGraphic();
      const mostMemoryGraphic = await this.findMostMemoryGraphic();

      const topSpeed = topSpeedGraphic.core_clock_MHz;
      const topBoostSpeed = topBoostSpeedGraphic.boost_clock_MHz;
      const mostMemory = mostMemoryGraphic.memory_GB;

      let speed = 0;
      let boostSpeed = 0;
      let memory = 0;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      await axios.post('/api/getProduct',{
        query: `MATCH (a:GraphicCard) WHERE a.price < ${this.state.price*this.state.pricePart.graphic/this.state.pricePart.total} return a order by a.core_clock_GHz DESC limit 50`
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          speed = _get(res.data[i], 'core_clock_GHz', 0);
          boostSpeed = _get(res.data[i], 'boost_clock_MHz', speed);
          memory = _get(res.data[i], 'memory_GB', 4);
          //calcular score
          scoreBase = ((speed/topSpeed + boostSpeed/topBoostSpeed*0.5 + memory/mostMemory*0.8) *100);
          if(res.data[i].rating_number > 200){
            incremento = (Math.pow(200, 1/Math.E)/10) * (res.data[i].rating*2/5-1);
          }else {
            incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/10) * (res.data[i].rating*2/5-1);
          }
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({graphicList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  findMostMemoryGraphic = () => {
    const that = this;
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:GraphicCard) WHERE a.memory_GB IS NOT NULL return a order by a.memory_GB DESC limit 1`
    })
    .then(function(res){
      return res.data[0];
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  findTopSpeedGraphic = () => {
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:GraphicCard) WHERE a.core_clock_MHz IS NOT NULL return a order by a.core_clock_MHz DESC limit 1`
    })
    .then(function(res){
      return res.data[0];
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  findTopBoostSpeedGraphic = () => {
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:GraphicCard) WHERE a.boost_clock_MHz IS NOT NULL return a order by a.boost_clock_MHz DESC limit 1`
    })
    .then(function(res){
      return res.data[0];
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  setRamListByScore = async() => {
    try{
      const that = this;
      const maxMemory = 256;
      const bestPriceMemory = await this.findBestPriceMemory('Ram');
      const topFrecuency = await this.findTopFrecuency();
      let memory = 0;
      let priceMemory = 0;
      let frecuency = 0;
      let scoreBase = 0;
      let incremento = 0;
      let modules = '';
      let lista = null;
      await axios.post('/api/getProduct',{
        query: `MATCH (a:Ram) WHERE a.price < ${this.state.price*this.state.pricePart.ram/this.state.pricePart.total} return a order by a.rating_number DESC limit 100`
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          modules = _get(res.data[i], 'modules', '0 x 0GB');
          memory = that.modulesToMemory(modules);
          priceMemory = _get(res.data[i], 'price_GB', 0);
          frecuency = _get(res.data[i], 'speed_frecuency', 4);
          //calcular score
          scoreBase = ((memory/maxMemory + bestPriceMemory/priceMemory*0.1 + frecuency/topFrecuency*0.1) *100);
          if(res.data[i].rating_number > 200){
            incremento = (Math.pow(200, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }else {
            incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/2) * (res.data[i].rating*2/5-1);
          }
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({ramList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  modulesToMemory = (param) => {
    return eval(param.replace(/x/g, "*").replace(/GB/g, ""));
  }

  findBestPriceMemory = async (param) => {
    let queryCode = '';
    if(param === 'SSD'){
      queryCode = `MATCH (a:Rom) WHERE a.type CONTAINS 'SSD' return a order by a.price_GB ASC limit 1`;
    }else if(param ==='HDD'){
      queryCode = `MATCH (a:Rom) return a order by a.price_GB ASC limit 1`;
    }else if(param === 'Ram') {
      queryCode = `MATCH (a:Ram) return a order by a.price_GB ASC limit 1`;
    }
    const a = await axios.post('/api/getProduct',{
      query: queryCode
    })
    .then(function(res){
      return _get(res.data[0],'price_GB');
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  findTopFrecuency = () => {
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:Ram) return a order by a.speed_frecuency DESC limit 1`
    })
    .then(function(res){
      return _get(res.data[0],'speed_frecuency');
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  setSSDListByScore = async() => {
    try{
      const that = this;
      const bestPriceMemory = await this.findBestPriceMemory('SSD');
      let priceMemory = 0;
      let price = 0;
      let numberTB = 1000;
      let capacity = 0;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      await axios.post('/api/getProduct',{
        query: `MATCH (a:Rom) WHERE a.price < ${this.state.price*this.state.pricePart.ssd/this.state.pricePart.total} AND a.type CONTAINS 'SSD' return a order by a.price DESC limit 300`
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          priceMemory = _get(res.data[i], 'price_GB', 0);
          price = _get(res.data[i], 'price');
          capacity = price/priceMemory;
          //calcular score
          scoreBase = ((capacity/numberTB + bestPriceMemory/priceMemory*0.1) *100);
          if(res.data[i].rating_number > 200){
            incremento = (Math.pow(200, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }else {
            incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({ssdList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  setHDDListByScore = async() => {
    try{
      const that = this;
      const bestPriceMemory = await this.findBestPriceMemory('HDD');
      let priceMemory = 0;
      let price = 0;
      let numberTB = 1000;
      let capacity = 0;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      await axios.post('/api/getProduct',{
        query: `MATCH (a:Rom) WHERE a.price < ${this.state.price*this.state.pricePart.hdd/this.state.pricePart.total} return a order by a.price DESC limit 300`
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          priceMemory = _get(res.data[i], 'price_GB', 0);
          price = _get(res.data[i], 'price');
          capacity = price/priceMemory;
          //calcular score
          scoreBase = ((capacity/numberTB + bestPriceMemory/priceMemory*0.1) *100);
          if(res.data[i].rating_number > 200){
            incremento = (Math.pow(200, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }else {
            incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({hddList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  setPowerListByScore = async() => {
    try{
      const that = this;
      const maxWattage = await this.findMaxWattage();
      let wattage = 0;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      let price = this.state.price*this.state.pricePart.power/this.state.pricePart.total
      await axios.post('/api/getProduct',{
        query: `MATCH (a:Power) WHERE a.price < ${price>40 ? price : 40} return a order by a.wattage_W DESC limit 100`
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          wattage = _get(res.data[i], 'wattage_W', 0);
          //calcular score
          scoreBase = ((wattage/maxWattage) *100);
          if(_includes(_get(res.data[i], 'efficiency'), 'Gold')){
            scoreBase *= 1.5;
          }else if(_includes(_get(res.data[i], 'efficiency'), 'Silver')){
            scoreBase *= 1.25;
          }

          if(_includes(_get(res.data[i], 'modular'), 'Full')){
            scoreBase *= 1.5;
          }else if(_includes(_get(res.data[i], 'modular'), 'Semi')){
            scoreBase *= 1.25;
          }

          if(res.data[i].rating_number > 200){
            incremento = (Math.pow(200, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }else {
            incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/5) * (res.data[i].rating*2/5-1);
          }
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({powerList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  findMaxWattage = async() => {
    const a = axios.post('/api/getProduct',{
      query: `MATCH (a:Power) return a order by a.wattage_W DESC limit 1`
    })
    .then(function(res){
      return _get(res.data[0],'wattage_W');
    })
    .catch(function (error) {
      console.log('query error in frontend');
    });
    return (a);
  }

  setCasesListByScore = async() => {
    try{
      const that = this;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      await axios.post('/api/getProduct',{
        query: `MATCH (a:Cases) WHERE a.price < ${this.state.price*this.state.pricePart.cases/this.state.pricePart.total} return a order by a.rating_number DESC limit 100`
      })
      .then(function(res){

        for(let i = 0; i< res.data.length; i++){
          scoreBase = _get(res.data[i],'price')*0.5;
          incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/2) * (res.data[i].rating*2/5-1);
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({casesList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  setMotherBoardListByScore = async() => {
    try{
      const that = this;
      let scoreBase = 0;
      let incremento = 0;
      let lista = null;
      let price = this.state.price*this.state.pricePart.motherBoard/this.state.pricePart.total;
      await axios.post('/api/getProduct',{
        query: `MATCH (a:MotherBoard)-[r:USE_SOCKET]-(b :Socket {type: '${this.state.socket}'}) WHERE a.price < ${price > 70 ? price : 70} return a order by a.rating_number DESC limit 100`
      })
      .then(function(res){
        for(let i = 0; i< res.data.length; i++){
          scoreBase = _get(res.data[i],'price')*0.5;
          incremento = (Math.pow(res.data[i].rating_number, 1/Math.E)/2) * (res.data[i].rating*2/5-1);
          res.data[i].score = scoreBase + scoreBase*incremento;
        }
        lista = _orderBy(res.data,['score'], ['desc']);
        that.setState({motherBoardList: lista});
      })
      .catch(function (error) {
        console.log('query error in frontend');
      });
    } catch(e){ console.log(e);} 
  }

  componentDidUpdate(){
    if(this.state.ready === true){
      const cpu = _get(this.state.cpuList,'[0]', undefined);
      const graphic = _get(this.state.graphicList,'[0]', undefined);
      const motherBoard = _get(this.state.motherBoardList,'[0]', undefined);
      const ram = _get(this.state.ramList,'[0]', undefined);
      const ssd = _get(this.state.ssdList,'[0]', undefined);
      const hdd = _get(this.state.hddList,'[0]', undefined);
      const power = _get(this.state.powerList,'[0]', undefined);
      const cases = _get(this.state.casesList,'[0]', undefined);
      let list = [];
      cpu!==undefined && (list = _concat(list, cpu));
      graphic!==undefined && (list = _concat(list, graphic));
      motherBoard!==undefined && (list = _concat(list, motherBoard));
      ram!==undefined && (list = _concat(list, ram));
      ssd!==undefined && (list = _concat(list, ssd));
      hdd!==undefined && (list = _concat(list, hdd));
      power!==undefined && (list = _concat(list, power));
      cases!==undefined && (list = _concat(list, cases));
      
      if(!_isEqual(list, this.state.data)){
        let aux = 0;
        this.setState({data: list});
        for(let i = 0; i< list.length; i++){
          aux += list[i].price;
        }
        this.setState({priceTotal: aux});
      }
    }
  }
  showMore = (name) => {
    switch(name){
      case _get(this.state,'cpuList[0].name'):
        this.setState({showMore: this.state.cpuList});
        break;
      case _get(this.state,'graphicList[0].name'):
        this.setState({showMore: this.state.graphicList});
        break;
      case _get(this.state,'ramList[0].name'):
        this.setState({showMore: this.state.ramList});
        break;
      case _get(this.state,'ssdList[0].name'):
        this.setState({showMore: this.state.ssdList});
        break;
      case _get(this.state,'hddList[0].name'):
        this.setState({showMore: this.state.hddList});
        break;
      case _get(this.state,'powerList[0].name'):
        this.setState({showMore: this.state.powerList});
        break;
      case _get(this.state,'casesList[0].name'):
        this.setState({showMore: this.state.casesList});
        break;
      case _get(this.state,'motherBoardList[0].name'):
        this.setState({showMore: this.state.motherBoardList});
        break;
    }
  }

  render() {
    const {userType} = this.props.AppState;

    return (
      <>
        <Header AppState={this.props.AppState} setLogged={this.props.setLogged} setUserType={this.props.setUserType} setShowChangeTypeForm={this.props.setShowChangeTypeForm} goHome={this.goHome}/>
        <div className="home row">
          <DehazeIcon className={`dehazeIcon ${this.state.showSidebar && 'actived'}`} onClick={this.setShowSidebarNeg}/>
          {this.state.showSidebar && <Sidebar className="col-xs-5 col-sm-3 col-lg-2" AppState={this.props.AppState} setUserType={this.props.setUserType} setShowChangeTypeForm={this.props.setShowChangeTypeForm}/>}
          <div className={`main ${this.state.showSidebar ? `col-xs-7 col-sm-9 col-lg-10` : `col-xs-12 col-sm-12`}`}>
            <div className="price-row row center-xs">
              <TextField className="price-input" id="outlined-basic" type="number" label="price €" variant="outlined" onKeyDown={(e) => {e.key==='Enter' && this.build()}} onChange={(e)=> {this.setPrice(e.target.value)}} value={this.state.price}/>
              <Button className="build" variant="contained" onClick={this.build}>Build!</Button>
            </div>
            <div className="price-total"><p className="">precio total : {Number(this.state.priceTotal.toFixed(2))} €</p></div>
            <div className="product-list row">
              {_map(this.state.data, (product) =><ProductBox info={product} key={product.name} showMore={this.showMore}/>)}
            </div>
            {
            this.state.showMore && <>
            <div className="overlay" onClick={() => this.setState({showMore: null})}></div>
            <div className="show-more-container row">
               {_map(this.state.showMore, (product) =><ProductBox info={product} key={product.name}/>)}
            </div>
            </>}
          </div>
        </div>
        <Footer/>
      </>
    );
  }
}
export default WithRouter(Home);