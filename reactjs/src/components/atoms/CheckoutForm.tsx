import React from 'react';

import { CardElement, injectStripe } from 'react-stripe-elements';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import styled from 'styled-components';
import { firestore } from 'firebase';
import axios from '../../lib/axios';

import firebase from '../../lib/firebase';

const CardElementWrapper = styled.div`
  margin: 15px;
`;

type Props = {} & any;

const joinHandler = (challengeId: string, user: any) => {
  const newData = {
    id: user.id,
    histories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    displayName: user.displayName,
    photoURL: user.photoURL,
    score: 0,
    days: 0
  };

  firebase
    .firestore()
    .runTransaction(async (transaction: firestore.Transaction) => {
      await firebase
        .firestore()
        .collection('challenges')
        .doc(challengeId)
        .get()
        .then((doc: firestore.DocumentSnapshot) => {
          const current: number = doc.data()!.participantsCount;
          doc.ref.update({ participantsCount: current + 1 });
        });
      await firebase
        .firestore()
        .collection('challenges')
        .doc(challengeId)
        .collection('participants')
        .doc(user.id)
        .set(newData)
        .then(() => {
          window.alert('チャレンジに参加しました'); // eslint-disable-line
        })
        .then(() => {
          window.location.reload(); // eslint-disable-line
        });
    })
    .then(() => console.log('successfully updated'));
};

class CheckoutForm extends React.PureComponent<Props> {
  state = {
    coupon: '',
    price: 0,
    isDiscount: false
  };

  constructor(props: any) {
    super(props);
    this.submit = this.submit.bind(this);
    this.apply = this.apply.bind(this);
    this.state.price = this.props.price;

    const paymentRequest = this.props.stripe.paymentRequest({
      country: 'JP',
      currency: 'jpy',
      total: {
        label: 'Challenge Charge',
        amount: this.state.price
      },
      requestPayerName: false,
      requestPayerEmail: false
    });

    paymentRequest.on('token', (event: any) => {
      // Send the token to your server to charge it!

      if (this.props.price > 50) {
        axios
          .post('/charges', {
            price: this.props.price,
            tokenId: event.token.id
          })
          .then((res: any) => console.log('Purchase Complete!'))
          .then(() => joinHandler(this.props.challengeId, this.props.user))
          .catch((err: any) => console.error(err));
      } else {
        console.log('do nothing.');
        joinHandler(this.props.challengeId, this.props.user);
      }
    });

    const elements = this.props.stripe.elements();
    const prButton = elements.create('paymentRequestButton', {
      paymentRequest
    });

    (async () => {
      // Check the availability of the Payment Request API first.
      const result = await paymentRequest.canMakePayment();
      if (result) {
        console.log('mount');
        prButton.mount('#payment-request-button');
      } else {
        console.log('none');
      }
    })();
  }

  onCouponChange = (e: any) => {
    e.preventDefault();
    this.setState({ coupon: e.target.value });
  };

  submit(event: any) {
    if (this.props.price > 50) {
      this.props.stripe
        .createToken({
          name: this.props.name
        })
        .then((res: any) =>
          axios.post('/charges', {
            price: this.props.price,
            tokenId: res.token.id
          })
        )
        .then((res: any) => console.log('Purchase Complete!'))
        .then(() => joinHandler(this.props.challengeId, this.props.user))
        .catch((err: any) => console.error(err));
    } else {
      console.log('do nothing.');
      joinHandler(this.props.challengeId, this.props.user);
    }
  }

  apply() {
    if (this.state.coupon === '') return;
    if (this.state.price === 0) return;

    axios
      .post('/coupons/valid', {
        coupon: this.state.coupon
      })
      .then((res: any) => {
        console.log(res);
        if (res.data.valid && !this.state.isDiscount) {
          this.setState({ price: this.props.price - res.data.amount_off });
          this.setState({ isDiscount: true });
        }
      });
  }

  render() {
    return (
      <React.Fragment>
        <Typography component="h3" variant="h5">
          チャレンジ購入 {this.state.price}円
        </Typography>
        <div id="payment-request-button" />
        <p>クレジットカード決済</p>
        <CardElementWrapper>
          <CardElement style={{ base: { fontSize: '14px' } }} />
        </CardElementWrapper>
        <div style={{ display: 'flex' }}>
          <TextField
            label="クーポン"
            value={this.state.coupon}
            onChange={this.onCouponChange}
          />
          <Button
            color="default"
            variant="outlined"
            size="small"
            onClick={this.apply}
          >
            適用
          </Button>
          <Button
            color="secondary"
            variant="contained"
            size="small"
            onClick={this.submit}
          >
            送信
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default injectStripe(CheckoutForm);
