import React, { Component } from 'react';
import { Search } from '@material-ui/icons';
import * as styles from './App.module.css';
import Product from './component/Product'

class App extends Component {
  state = {
    products : [
      { id: 1, name: "conjured", sellIn: 4, quality: 20 },
      { id: 2, name: "aged brie", sellIn: 15, quality: 30 },
      { id: 3, name: "normal", sellIn: 6, quality: 50 },
      { id: 4, name: "backstage", sellIn: 8, quality: 10 },
      { id: 5, name: "sulfuras", sellIn: 0, quality: 80 },
    ],
    filteredproducts : [
      { id: 1, name: "conjured", sellIn: 4, quality: 20 },
      { id: 2, name: "aged brie", sellIn: 15, quality: 30 },
      { id: 3, name: "normal", sellIn: 6, quality: 50 },
      { id: 4, name: "backstage", sellIn: 8, quality: 10 },
      { id: 5, name: "sulfuras", sellIn: 0, quality: 80 },
    ],
    query: ''
  }
  handleSearch = (e) => {
    const query = e.target.value;
    const {products} = this.state;
    const newFilteredProducts = products
    // .filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    .reduce((acc,c) => {
      if(c.name.toLowerCase().includes(query.toLowerCase())){
        return [...acc,c];
      }
      return acc;
    },[]);
    this.setState({query,filteredproducts: newFilteredProducts});
  }
  handleChangedate = (e) => {
    let date = new Date()
    const picked =  e.target.value
    const diff = Math.abs(date.getTime() - new Date(picked).getTime())
    const days = Math.ceil(diff / (1000 *60 *60 *24))
    console.log(days)
  }
  render() {
    let product_list = (
      this.state.filteredproducts.map(product => {
        return <Product
          name={product.name}
          sellIn={product.sellIn}
          qua={product.quality}
          changedate={this.handleChangedate}
          key={product.id} />
      })
)
    return (
      <div className={styles.app}>
        <div className={styles.header}>
          <p> Product List </p>
          <div className={styles.inputWrapper}>
            <Search className={styles.icon} />
            <input ref={r => this.inputRef = r} placeholder='Search Products' type="text" value={this.state.query}
              onChange={this.handleSearch} />
          </div>
        </div>
        <div className={styles.data}>
          {product_list}
        </div>
      </div>
    )
  }
}

export default App;