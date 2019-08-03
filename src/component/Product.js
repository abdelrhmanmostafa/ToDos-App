import React from "react"
import * as styles from './product.module.css'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

const usestyles = makeStyles(theme =>({
    textfield : {
        marginRight: theme.spacing(1)
    }
}))

const Product = props => {
    const classes = usestyles()
    return (
        <div className={styles.card}>
            <div className={styles.horizontalInline}>
                <h1>{props.name}</h1>
                <div className={styles.sell}>
                    <p className={styles.circleSill}>{props.sellIn}</p>
                    <p>Sell In</p>
                </div>
            </div>
            <div className={styles.horizontalInline}>
                <p className={styles.quaStyle}>Quality: {props.qua}</p>
                <TextField type="date"
                    id="date"
                    className={classes.textfield}
                    onChange={props.changedate}
                    defaultValue="2019-07-28" />
            </div>
            <div className={styles.buttonDiv}>
                <button>Add to cart</button>
            </div>
        </div>
    )
}

export default Product