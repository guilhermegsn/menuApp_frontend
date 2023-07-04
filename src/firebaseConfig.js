import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Alteração na importação

import configs from "./configs";

const firebaseConfig = {
    apiKey: configs.apiKey,
    authDomain: configs.authDomain,
    databaseURL: configs.databaseURL,
    projectId: configs.projectId,
    storageBucket: configs.storageBucket,
    messagingSenderId: configs.messagingSenderId,
    appId: configs.appId,
    measurementId: configs.measurementId
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  
  export { app, analytics, db };