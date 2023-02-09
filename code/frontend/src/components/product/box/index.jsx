import React, { Component } from 'react';
import _get from "lodash/get";
import _map from "lodash/map";
import _omit from "lodash/omit";
import Rating from '@mui/material/Rating';
import "./index.css"
export default class ProductBox extends Component {
  render() {
    const productInfo = _omit(this.props.info, ['name', 'img_src', 'link', 'rating', 'rating_number', 'score']);
    const score = _get(this.props.info, 'score', undefined);
    const name = _get(this.props.info, 'name');
    const img_src = _get(this.props.info, 'img_src');
    const link = _get(this.props.info, 'link');
    const rating = _get(this.props.info, 'rating');
    const rating_number = _get(this.props.info, 'rating_number');
    return (
      <div className="product-box col-xs-12 col-sm-6 row start-xs">
        <div className="img col-xs-5">
          <a href={link}>
            <img src={img_src} alt={name} width="100%"/>
          </a>
        </div>
        <div className="info col-xs-7">
          {this.props.showMore && <div className="show-more" onClick={() => this.props.showMore(name)}>ver más</div>}
          <a href={link}>
            <h2 className="product-title">{name}</h2>
          </a>
          {score && <p className='score'>SCORE: {score}</p>}
          <div className="rating">
            <Rating name="half-rating" defaultValue={rating} precision={0.2} />
            <div className="rating-number">({rating_number})</div>
          </div>
          {_map(productInfo,(info, label) => !(info==='') && <p key={label}>{label} : {info}</p>)}
        </div>
      </div>
    )
  }
}