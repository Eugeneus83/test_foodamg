import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import styles from './Cart.module.css';
import Modal from "../UI/Modal";
import CartItem from "./CartItem";
import SubmitOrder from './SubmitOrder';
import {cartActions} from "../../store/cart-slice";

const Cart = (props) => {

    const dispatchFunction = useDispatch();
    const cart = useSelector((state) => state.cart);
    const accessToken = useSelector((state) => state.main.accessToken);

    const [isSubmitOrderAvailable, setIsSubmitOrderAvailable] = useState(false);
    const [isDataSubmitting, setIsDataSubmitting] = useState(false);
    const [wasDataSendingSuccessful, setWasDataSendingSuccessful] = useState(false);
    const [error, setError] = useState(false);

    const orderHandler = (event) => {
        event.preventDefault();

        const totalAmount = cart.items.reduce((currentValue, item) => {
            return currentValue + item.amount * item.price;
        }, 0);

        if (totalAmount < 15) {
            setError('Total amount has to be at least 15 eur');
            return;
        }

        setIsSubmitOrderAvailable(true);
    };

    const submitOrderHandler = async (orderData) => {
        setIsDataSubmitting(true);
        const response = await fetch('/api/orders/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            },
            body: JSON.stringify({
                name: orderData.name,
                phone: orderData.phone,
                address: orderData.address,
                items: cart.items
            })
        });

        setIsDataSubmitting(false);
        if (!response.ok) {
            setWasDataSendingSuccessful(false);
            setError('Something is wrong. Please try later');
        }else {
            setWasDataSendingSuccessful(true);
            dispatchFunction(cartActions.clearCart());
        }
    };

    const cartItems = <ul className={styles['cart-items']}>
        {cart.items.map(item => <CartItem
            key={item.id}
            name={item.name}
            price={item.price}
            amount={item.amount}
        />)}
    </ul>;

    let totalAmount = cart.items.reduce((accumulator, item) => accumulator + item.price * item.amount, 0);
    totalAmount = parseFloat(totalAmount);
    totalAmount = `$${Math.abs(totalAmount).toFixed(2)}`;

    const hasItems = cart.items.length > 0;

    const modalButtons = <div className={styles.actions}>
        <button className={styles['button-alt']} onClick={props.onHideCart}>Close</button>
        {hasItems && <button className={styles.button} onClick={orderHandler}>Make order</button>}
    </div>;

    const modalContent = (
        <React.Fragment>
            {cartItems}
            <div className={styles.total}>
                <div>Total</div>
                <div>{totalAmount}</div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {isSubmitOrderAvailable && <SubmitOrder onCancel={props.onHideCart} onSubmit={submitOrderHandler}/>}
            {!isSubmitOrderAvailable && modalButtons}
        </React.Fragment>
    );

    const dataSuccessfullySent =
        <React.Fragment>
            <p>Data successfully sent</p>
            <div className={styles.actions}>
                <button className={styles['button-alt']} onClick={props.onHideCart}>Close</button>
            </div>
        </React.Fragment>;

    return <Modal onHideCart={props.onHideCart}>
        {!isDataSubmitting && !wasDataSendingSuccessful && modalContent}
        {isDataSubmitting && <p>Sending data</p>}
        {wasDataSendingSuccessful && dataSuccessfullySent}
    </Modal>
};

export default Cart;
