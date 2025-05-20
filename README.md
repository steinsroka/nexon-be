# Nexon Backend

이벤트/보상 관리 플랫폼 백엔드 서비스

## 기술 스택

- Node.js: v18.18.2
- NestJS: 최신
- MongoDB
- Docker & Docker Compose

## 프로젝트 구조

- **[auth-server](apps/auth-server/README.md)**: 인증 및 사용자 관리 서버 (포트: 3001)
- **event-server**: 이벤트 및 보상 관리 서버 (포트: 3002)
- **gateway-server**: API 게이트웨이 서버 (포트: 3000)

## 의존성 설치

```bash
# 모든 서비스의 의존성 설치
npm run install:all

# 또는 각 서비스별 의존성 설치
npm run install:auth
npm run install:event
npm run install:gateway
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

## 주석 전략

`TODO: ` 해야할 일
`NOTE: ` 기록용

## 관리자 계정

admin@nexon.com
password123!

# 아쉬운점

transaction 적용 못한거
{
"name": "여름방학 이벤트",
"description": "여름방학을 맞이해 메이플이 쏜다",
"startDate": "2025-05-01T00:00:00.000Z",
"endDate": "2025-05-31T00:00:00.000Z",
"status": "ACTIVE",
"conditions": [
{
"type": "USER_INVITE",
"metadata": {
"inviteCount": 1
},
"description": "조건 설명"
},
{
"type": "LOGIN_BETWEEN",
"metadata": {
"startDate": "2025-05-01T00:00:00.000Z",
"endDate": "2025-05-31T00:00:00.000Z"
},
"description": "조건 설명"
},
{
"type": "QUEST_CLEAR_COUNT",
"metadata": {
"clearCount": 1
},
"description": "조건 설명"
}
],
"rewards": [
{
"type": "POINT",
"quantity": 100,
"description": "보상 설명"
},
{
"type": "COUPON",
"quantity": 100,
"description": "보상 설명"
},
{
"type": "ITEM",
"itemId": "64a78e6e5d32a83d8a0d3f4c",
"quantity": 100,
"description": "보상 설명"
}
]
}
