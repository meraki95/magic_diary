// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // 여기에 파이어베이스 설정 정보를 넣으세요
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };