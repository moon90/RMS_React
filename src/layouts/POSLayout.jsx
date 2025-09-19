
import React from 'react';
import '../styles/POS.css';

const POSLayout = ({
  topBarButtons,
  productPanel,
  cartPanel,
}) => {
  return (
    <div className="pos-layout">
      <div className="top-bar">
        <div className="logo">POS</div>
        <div className="top-bar-buttons">
          {topBarButtons.map((button, index) => (
            <button key={index} onClick={button.onClick} className={`btn ${button.color}`}>
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="product-panel">{productPanel}</div>
        <div className="cart-panel">{cartPanel}</div>
      </div>
    </div>
  );
};

export default POSLayout;
