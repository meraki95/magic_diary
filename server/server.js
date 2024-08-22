const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const NodeCache = require('node-cache');
const sharp = require('sharp');
const path = require('path');
require('dotenv').config();

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
  }),
});

const app = express();

// CORS 설정
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

const imageCache = new NodeCache({ stdTTL: 3600 });

// 카카오 로그인 라우트
app.post('/api/kakaoLogin', async (req, res) => {
  const { kakaoToken } = req.body;

  try {
    // 카카오 API를 사용하여 사용자 정보 가져오기
    const userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoToken}` }
    });

    const { id: kakaoId, properties, kakao_account } = userInfoResponse.data;
    const email = kakao_account?.email || `${kakaoId}@kakao.com`;
    const displayName = properties?.nickname || 'Kakao User';

    // Firebase에서 사용자 확인 또는 생성
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        try {
          const users = await admin.auth().getUsers([{ providerId: 'kakao.com', providerUid: kakaoId.toString() }]);
          if (users.users.length > 0) {
            userRecord = users.users[0];
          } else {
            userRecord = await admin.auth().createUser({
              email: email,
              emailVerified: true,
              displayName: displayName,
              photoURL: properties?.profile_image,
              providerData: [{ providerId: 'kakao.com', providerUid: kakaoId.toString() }]
            });
          }
        } catch (innerError) {
          console.error('카카오 사용자 생성 오류:', innerError);
          throw innerError;
        }
      } else {
        throw error;
      }
    }

    // 사용자 정보 업데이트 (필요한 경우)
    if (userRecord.displayName !== displayName || userRecord.photoURL !== properties?.profile_image) {
      await admin.auth().updateUser(userRecord.uid, {
        displayName: displayName,
        photoURL: properties?.profile_image,
      });
    }

    // 커스텀 클레임 설정
    await admin.auth().setCustomUserClaims(userRecord.uid, { kakaoId: kakaoId });

    // Firebase 커스텀 토큰 생성
    const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);

    res.json({ firebaseToken });
  } catch (error) {
    console.error('카카오 로그인 처리 오류:', error);
    res.status(500).json({ error: '카카오 로그인 처리에 실패했습니다.' });
  }
});

// GPT 일기 생성 라우트
app.post('/api/generate-diary', async (req, res) => {
  const { userInput, prompt } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '사용자가 제공한 정보만을 사용하여 400자 내외의 일기를 작성하세요. 날짜, 추가적인 사건, 상상의 감정을 포함하지 마세요. 오직 사용자가 언급한 사실만 사용하세요. 만약 사람 이름으로 추정되는 단어가 있다면 반드시 포함하세요.',
          },
          {
            role: 'user',
            content: `다음 내용을 바탕으로 ${prompt} 사용자가 언급한 사실만을 포함하여 400자 내외의 일기를 작성하세요: ${userInput}`,
          },
        ],
        max_tokens: 500,
        n: 3,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    const diaryOptions = response.data.choices.map((choice) => choice.message.content.trim());
    res.json({ diaryOptions });
  } catch (error) {
    console.error('GPT 호출 오류:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: '일기 생성에 실패했습니다. 다시 시도해주세요.' });
  }
});

// 레오나르도 API를 사용한 이미지 생성 라우트
app.post('/api/generate-image', async (req, res) => {
  const { diary, style, characters } = req.body;

  try {
    const backgroundDescription = await extractKeyBackgroundAndTranslate(diary, characters);
    
    const cacheKey = `${backgroundDescription}-${style}`;
    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      return res.json({ imageUrl: cachedImage });
    }

    const requestBody = {
      prompt: `A detailed, scenic background of ${backgroundDescription}. Style: ${style || 'photorealistic'}. Create a vivid and immersive landscape or environment, focusing purely on the atmosphere and key background elements described. Ensure there are no signs, symbols, text, or lettering present. The scene should be devoid of any people, characters, animals, or artificial structures.`,
      width: 512,
      height: 512,
      negative_prompt: "people, person, human, character, face, body, hands, feet, text, words, letters, typography, font, signage, symbols, figures, silhouettes, animals",
      modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
      num_images: 1,
    };

    const response = await axios.post(
      'https://cloud.leonardo.ai/api/rest/v1/generations',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${LEONARDO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generationId = response.data.sdGenerationJob.generationId;

    let imageUrl = null;
    let attempts = 0;
    while (!imageUrl && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      const statusResponse = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${LEONARDO_API_KEY}`,
          }
        }
      );

      if (statusResponse.data.generations_by_pk.status === 'COMPLETE') {
        imageUrl = statusResponse.data.generations_by_pk.generated_images[0].url;
        imageCache.set(cacheKey, imageUrl);
      }
      attempts++;
    }

    if (imageUrl) {
      res.json({ imageUrl });
    } else {
      throw new Error('이미지 생성 시간 초과');
    }
  } catch (error) {
    console.error('Leonardo API 오류:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: '이미지 생성에 실패했습니다.' });
  }
});

// 배경 정보 추출 및 번역 함수
async function extractKeyBackgroundAndTranslate(koreanDiary, characters) {
  try {
    const characterNames = characters.map(char => char.name).join(', ');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a translator and content editor. Your task is to translate Korean diary entries to English, remove all mentions of specific people\'s names (including the names provided), and adjust the text to maintain natural flow. Focus on describing the environment, setting, and mood without mentioning individuals or any human presence.',
          },
          {
            role: 'user',
            content: `Translate the following Korean diary entry to English, remove all mentions of specific people's names (including these names: ${characterNames}), and adjust the text to maintain natural flow. Focus on the key background elements, environment, and mood without any human presence: ${koreanDiary}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('핵심 배경 추출 및 번역 오류:', error);
    throw new Error('핵심 배경 추출 및 번역에 실패했습니다.');
  }
}

// 이미지 프록시 라우트
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).send('Error fetching image');
  }
});

// 이미지 합성 API
app.post('/api/composite-image', async (req, res) => {
  try {
    const { backgroundUrl, characters } = req.body;
    console.log("Received request for composite-image:", { backgroundUrl, characters });

    const backgroundResponse = await axios.get(backgroundUrl, { responseType: 'arraybuffer' });
    let background = sharp(backgroundResponse.data);

    const { width: bgWidth, height: bgHeight } = await background.metadata();
    console.log("Background image dimensions:", { bgWidth, bgHeight });

    for (let character of characters) {
      console.log("Processing character:", character);
      if (!character.image) {
        console.log("Skipping character due to missing image:", character.name);
        continue;
      }

      try {
        const charResponse = await axios.get(character.image, { responseType: 'arraybuffer' });
        let charImage = sharp(charResponse.data);

        const resizedChar = await charImage
          .resize({ width: Math.round(bgWidth / 4), height: Math.round(bgHeight / 4), fit: 'inside' })
          .composite([{
            input: Buffer.from([255, 255, 255, Math.round(character.opacity * 255)]),
            raw: { width: 1, height: 1, channels: 4 }
          }])
          .toBuffer();

        background = background.composite([{ 
          input: resizedChar, 
          top: Math.round(character.y), 
          left: Math.round(character.x) 
        }]);
      } catch (charError) {
        console.error('캐릭터 이미지 처리 오류:', charError);
      }
    }

    const outputBuffer = await background.jpeg().toBuffer();
    const base64Image = outputBuffer.toString('base64');
    const compositedImageUrl = `data:image/jpeg;base64,${base64Image}`;

    console.log("Composite image created successfully");
    res.json({ compositedImageUrl });
  } catch (error) {
    console.error('이미지 합성 오류:', error);
    res.status(500).json({ error: '이미지 합성에 실패했습니다.' });
  }
});

// 정적 파일 제공을 위한 미들웨어
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

app.get('/api/diary-count/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const diarySnapshot = await admin.firestore().collection('diaries').where('userId', '==', userId).get();
    const diaryCount = diarySnapshot.size;
    res.json({ count: diaryCount });
  } catch (error) {
    console.error('일기 개수 조회 오류:', error);
    res.status(500).json({ error: '일기 개수 조회에 실패했습니다.' });
  }
});

// AI 상담 엔드포인트
app.post('/api/ai-counseling', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Received request for user ID:', userId);

    const diarySnapshot = await admin.firestore().collection('diaries')
      .where('userId', '==', userId)
      .orderBy('entryDate', 'desc')
      .limit(10)
      .get();
    
    console.log('Retrieved diary count:', diarySnapshot.size);

    if (diarySnapshot.size < 5) {
      console.log('Insufficient diary count');
      return res.status(400).json({ message: `일기가 5개 이상 있어야 AI 상담을 받을 수 있습니다. 현재 ${diarySnapshot.size}개의 일기가 있습니다.` });
    }

    const diaries = diarySnapshot.docs.map(doc => {
      const data = doc.data();
      let formattedDate = 'Unknown Date';

      if (data.entryDate) {
        if (typeof data.entryDate.toDate === 'function') {
          formattedDate = data.entryDate.toDate().toISOString().split('T')[0];
        } else if (data.entryDate instanceof Date) {
          formattedDate = data.entryDate.toISOString().split('T')[0];
        } else if (typeof data.entryDate === 'string') {
          formattedDate = data.entryDate;
        } else if (typeof data.entryDate === 'number') {
          formattedDate = new Date(data.entryDate).toISOString().split('T')[0];
        }
      }

      return {
        userInput: data.userInput || '',
        entryDate: formattedDate
      };
    });

    console.log('Diary entries:', diaries);

    const diaryContents = diaries.map(diary => `날짜: ${diary.entryDate}\n내용: ${diary.userInput}`).join('\n\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 심리 상담사입니다. 사용자의 일기를 분석하고 감정 상태, 주요 활동, 그리고 반드시 조언을 제공해주세요. 응답은 반드시 다음 형식을 따라주세요: \n주요 감정: [감정 분석]\n감정 변화 추이: [변화 추이 분석]\n주요 활동: [활동 분석]\n조언: [상세한 조언]'
          },
          {
            role: 'user',
            content: `다음은 사용자의 최근 일기 내용입니다. 이를 바탕으로 사용자의 주요 감정, 감정 변화 추이, 주요 활동을 분석하고 반드시 적절한 조언을 해주세요:\n\n${diaryContents}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const analysisResult = response.data.choices[0].message.content;
    console.log('GPT API Response:', analysisResult);

    const mainEmotion = analysisResult.match(/주요 감정: (.+)(?:\n|$)/)?.[1] || '분석 불가';
    const emotionTrend = analysisResult.match(/감정 변화 추이: (.+)(?:\n|$)/)?.[1] || '분석 불가';
    const mainActivities = analysisResult.match(/주요 활동: (.+)(?:\n|$)/)?.[1] || '분석 불가';
    const advice = analysisResult.match(/조언: (.+)(?:\n|$)/)?.[1] || '현재 상태를 유지하면서 긍정적인 활동을 계속하세요. 어려움이 있다면 주변 사람들과 대화를 나누어 보세요.';

    const result = {
      mainEmotion,
      emotionTrend,
      mainActivities,
      advice
    };

    console.log('Parsed result:', result);

    res.json(result);

  } catch (error) {
    console.error('AI 상담 오류:', error);
    res.status(500).json({ message: 'AI 상담에 실패했습니다. 잠시 후 다시 시도해 주세요.' });
  }
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Firebase initialized:', admin.apps.length > 0);
});