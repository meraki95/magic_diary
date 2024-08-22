FROM node:14

WORKDIR /app

# 백엔드 파일만 복사
COPY server ./server

# 백엔드 디렉토리로 이동
WORKDIR /app/server

# 백엔드 의존성 설치
RUN npm install

# 백엔드 빌드 (필요한 경우)
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]