import React, { useState, useEffect } from 'react';
import { Container, Form, Item, Label, Input, Text, Button } from 'native-base';
import shortid from 'shortid';
import { withRouter } from 'react-router-native';
import { AuthSession } from 'expo';
import { Keyboard } from 'react-native';
import twitter, { TWLoginButton } from 'react-native-simple-twitter';
import firebase from '~/lib/firebase';
import {
  getTwitterAccessToken,
  getTwitterRequestToken,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET
} from '~/lib/twitter';

import SubmitButton from './SubmitButton';
import { successToast, errorToast } from './Toast';

const LOGIN_MESSAGE_SUCCESS = 'ログインに成功しました';

const AuthScreen = (props: any) => {
  const { history } = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [oauthTokenSecret, setOauthTokenSecret] = useState('');

  useEffect(() => {
    twitter.setConsumerKey(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET);
  }, []);

  const signInSuccessWithAuthCallback = (
    credentials: firebase.auth.UserCredential
  ) => {
    const { user } = credentials;

    const isTwitter =
      credentials.additionalUserInfo &&
      credentials.additionalUserInfo.providerId === 'twitter.com';

    const data = {
      id: user!.uid,
      shortId: shortid.generate(),
      displayName: user!.displayName,
      photoURL: user!.photoURL,
      createdAt: new Date(),
      updatedAt: new Date(),
      twitterUsername: isTwitter
        ? (credentials.additionalUserInfo! as any).username
        : ''
    };

    const secureId = shortid.generate();
    const dataSecure = {
      id: secureId,
      email: user!.email,
      accessTokenKey: isTwitter
        ? (credentials.credential! as any).accessToken
        : '',
      accessTokenSecret: isTwitter
        ? (credentials.credential! as any).secret
        : ''
    };

    const userRef = firebase
      .firestore()
      .collection('users')
      // uidにしないと、reduxのprofileとfirestoreのusersが同期しない。
      .doc(user!.uid);

    userRef.get().then(doc => {
      if (!doc.exists) {
        userRef.set(data);
        userRef
          .collection('securities')
          .doc(secureId)
          .set(dataSecure);
      }
    });

    return false;
  };

  const signInWithEmail = (email: string, password: string) => {
    // キーボードは閉じる
    Keyboard.dismiss();

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(credential => signInSuccessWithAuthCallback(credential))
      .then(() => successToast('/', history.push, LOGIN_MESSAGE_SUCCESS))
      .catch(() =>
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then(credential => signInSuccessWithAuthCallback(credential))
          .then(() =>
            successToast('/settings', history.push, LOGIN_MESSAGE_SUCCESS)
          )
          .catch(error => errorToast(error.message))
      );
  };

  // 一旦お蔵入り...
  const signUpWithTwitter = async () => {
    const res: any = await getTwitterRequestToken();
    const { oauth_token, oauth_token_secret } = res; //eslint-disable-line

    /* eslint-disable */
    if (!oauth_token || !oauth_token_secret) {
      errorToast(oauth_token);
      return;
    }
    /* eslint-enable */

    const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`; //eslint-disable-line

    /* eslint-disable */
    const oauth_verifier = await AuthSession.startAsync({
      authUrl,
      returnUrl: 'scheme://'
    }).then((res: any) => res.params.oauth_verifier);
    /* eslint-enable */

    const result: any = await getTwitterAccessToken({
      oauth_token, //eslint-disable-line
      oauth_token_secret, //eslint-disable-line
      oauth_verifier //eslint-disable-line
    });

    /* eslint-disable */
    if (
      result.status !== 200 ||
      !(result.data.oauth_token && result.data.oauth_token_secret)
    ) {
      console.log(result.deata.message);
      errorToast(result.data.message);
      return;
    }
    /* eslint-enable */

    const credential = firebase.auth.TwitterAuthProvider.credential(
      result.data.oauth_token, //eslint-disable-line
      result.data.oauth_token_secret //eslint-disable-line
    );

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(credential => signInSuccessWithAuthCallback(credential))
      .then(() => successToast('/', history.push, LOGIN_MESSAGE_SUCCESS))
      .catch(error => errorToast(error.message));
  };

  const onGetAccessToken = ({
    oauth_token: token,
    oauth_token_secret: tokenSecret
  }: any) => {
    setOauthToken(token);
    setOauthTokenSecret(tokenSecret);
  };

  const onError = (err: any) => {
    errorToast(err.message);
  };

  const onSuccess = async (user: any) => {
    const credential = firebase.auth.TwitterAuthProvider.credential(
      oauthToken,
      oauthTokenSecret
    );

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(credential => signInSuccessWithAuthCallback(credential))
      .then(() => successToast('/', history.push, LOGIN_MESSAGE_SUCCESS))
      .catch(error => errorToast(error.message));
  };

  return (
    <Container>
      <TWLoginButton
        onGetAccessToken={onGetAccessToken}
        onSuccess={onSuccess}
        onError={onError}
      >
        <Text style={{ textAlign: 'center' }}>Twitterでログイン</Text>
      </TWLoginButton>
      <Text />
      <Text style={{ textAlign: 'center' }}>または</Text>
      <Form>
        <Item floatingLabel>
          <Label>メールアドレス</Label>
          <Input
            autoCapitalize="none"
            autoCorrect
            onChangeText={text => setEmail(text)}
          />
        </Item>
        <Item floatingLabel>
          <Label>パスワード</Label>
          <Input
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={text => setPassword(text)}
          />
        </Item>
        <Text />
        <SubmitButton
          handler={() => signInWithEmail(email, password)}
          text="メールでログイン"
        />
      </Form>
    </Container>
  );
};

export default withRouter(AuthScreen);
