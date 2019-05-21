const functions = require('firebase-functions');
const { db } = require('./admin');

exports.registerUsers = functions.auth.user().onCreate(user => {
  const { uid } = user;
  const displayName = user.displayName || 'Anonymous';
  const email = user.email || '';
  const photoURL = user.photoURL || '';

  return db
    .collection('users')
    .doc(uid)
    .set({
      user_name: displayName,
      photo_url: photoURL,
      email,
      create_on: new Date()
    })
    .then(() => {
      console.log('Success'); // eslint-disable-line no-console
    })
    .catch(err => {
      console.log(err); // eslint-disable-line no-console
    });
});
