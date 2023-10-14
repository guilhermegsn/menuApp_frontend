import * as Firebase from 'firebase';

const app = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID
});
Firebase.initializeApp(app);
export default Firebase;
inscrição.js

    import React, { useState  } from 'react';
    import Firebase from './container/Firebase';
    import 'react-phone-number-input/style.css'
    import PhoneInput from 'react-phone-number-input'

    const Signup= () => {

    const [value, setValue] = useState(0);

function setuprecaptcha (){
    window.recaptchaVerifier = new Firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: function (response) {
            console.log("recature resolved")
            this.onSignInSubmit();
        }
    });

}

 
function onSignInSubmit(event) {
    
    event.preventDefault();
    setuprecaptcha();
    var phoneNumber = value;
    var appVerifier = window.recaptchaVerifier;
    Firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
            console.log("Success");
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            var verificationId = window.prompt("Enter otp")
            confirmationResult
                .confirm(verificationId)
                .then(function (result) {
                    // User signed in successfully.
                    var user = result.user;
                    user.getIdToken().then(idToken => {
                        window.localStorage.setItem('idToken', idToken);

                       
                        console.log(idToken);
                    });
                })
                .catch(function (error) {
                    // User couldn't sign in (bad verification code?)
                    console.error("Error while checking the verification code", error);
                    window.alert(
                        "Error while checking the verification code:\n\n" +
                        error.code +
                        "\n\n" +
                        error.message
                    );
                });

        })
        .catch(function (error) {
            console.log("sign Up error:" + error.code);
        });
      }}