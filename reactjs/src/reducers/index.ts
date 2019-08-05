import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';
import { connectRouter } from 'connected-react-router';
import userReducer from './userReducer';
import ogpReducer from './ogpReducer';
import challengeReducer from './challengeReducer';
import categoryReducer from './categoryReducer';
import topicReducer from './topicReducer';
import giphyReducer from './gitphyReducer';

export const createRootReducer = (history: any) =>
  combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    user: userReducer,
    ogp: ogpReducer,
    router: connectRouter(history),
    challenge: challengeReducer,
    category: categoryReducer,
    topic: topicReducer
  });

export const createRootReducerForRN = () =>
  combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    user: userReducer,
    challenge: challengeReducer,
    category: categoryReducer,
    topic: topicReducer,
    giphy: giphyReducer
  });
