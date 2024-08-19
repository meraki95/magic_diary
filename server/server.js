const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const bodyParser = require('body-parser');

// Firebase Admin SDK 초기화
const serviceAccount = require('./serviceAccountKey.json'); // 올바른 경로로 수정

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

app.post('/api/kakaoLogin', async (req, res) => {
  const { kakaoToken } = req.body;

  try {
    // 카카오 사용자 정보 요청
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
      },
    });

    console.log('카카오 API 응답:', response.data);

    const user = response.data;

    console.log('Firebase 사용자 ID:', user.id);

    // 사용자 ID를 Firebase UID로 사용하여 Custom Token 생성
    const firebaseToken = await admin.auth().createCustomToken(user.id.toString());

    console.log('Firebase Custom Token 생성 성공:', firebaseToken);

    res.json({ firebaseToken });
  } catch (error) {
    console.error('Error creating Firebase Custom Token:', error.response ? error.response.data : error.message);
    res.status(500).send('Custom Token creation error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
