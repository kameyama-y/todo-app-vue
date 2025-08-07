// Firebase SDK の必要なモジュールをインポート
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebaseの設定情報（Firebaseコンソールからコピーする）
const firebaseConfig = {
  apiKey: "AIzaSyCh4LgE3_sM3Vr-jfJRFw9aAuPIGlMIn-c",
  authDomain: "todo-list-vuejs-1a711.firebaseapp.com",
  projectId: "todo-list-vuejs-1a711",
  storageBucket: "todo-list-vuejs-1a711.firebasestorage.app",
  messagingSenderId: "753620669713",
  appId: "1:753620669713:web:491321d0084d59c5a1e8b0",
  measurementId: "G-XTEL2S1D04"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Authenticationのインスタンスをエクスポート
export const auth = getAuth(app);

// Firestoreのインスタンスをエクスポート
export const db = getFirestore(app);

