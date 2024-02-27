
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB2KJq3aKdJ_351xCz9nXpuj9MKwAloqaE",
  authDomain: "registro-chamados.firebaseapp.com",
  projectId: "registro-chamados",
  storageBucket: "registro-chamados.appspot.com",
  messagingSenderId: "543339824755",
  appId: "1:543339824755:web:1e5419ee3ed36a9b824c06",
  measurementId: "G-SHEM3914BC"
};
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };