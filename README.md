# Nexon Backend

이벤트/보상 관리 플랫폼 백엔드 서비스

## 기술 스택

- Node.js: v18.18.2
- NestJS: 최신
- MongoDB
- Docker & Docker Compose

## 프로젝트 구조

- **auth-server**: 인증 및 사용자 관리 서버 (포트: 3001)
- **event-server**: 이벤트 및 보상 관리 서버 (포트: 3002)
- **gateway-server**: API 게이트웨이 서버 (포트: 3000)

## 설치 및 설정

### 환경 요구사항

- Node.js v18.18.2
- npm v9.8.1
- Docker & Docker Compose

### 의존성 설치

```bash
# 모든 서비스의 의존성 설치
npm run install:all

# 또는 각 서비스별 의존성 설치
npm run install:auth
npm run install:event
npm run install:gateway
```

### 환경 변수 설정

각 서비스 디렉토리의 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.

```bash
cp auth-server/.env.example auth-server/.env
cp event-server/.env.example event-server/.env
cp gateway-server/.env.example gateway-server/.env
```

## 실행 방법

### 개발 환경 실행

```bash
# 개발 모드로 모든 서비스 실행 (백그라운드)
npm run dev:detach

# 개발 모드로 모든 서비스 실행 (포그라운드)
npm run dev

# 로그 확인
npm run logs
```

### 프로덕션 환경 실행

```bash
# Docker 이미지 빌드
npm run build

# 모든 서비스 실행 (백그라운드)
npm run start:detach

# 모든 서비스 실행 (포그라운드)
npm run start

# 서비스 중지
npm run stop

# 서비스 중지 및 볼륨 삭제
npm run prune
```

## API 문서

각 서비스의 API 문서는 다음 URL에서 확인할 수 있습니다:

- 인증 서버: http://localhost:3001/api
- 이벤트 서버: http://localhost:3002/api
- 게이트웨이: http://localhost:3000/api