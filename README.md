# Nexon Backend

## 기술 스택

- Node.js: v18.18.2
- NestJS
- MongoDB
- Docker & Docker Compose
- JWT 인증

## 실행

### Docker

```bash
# 빌드
npm run docker:build

# 실행
npm run docker:start:detach

# 중지
npm run docker:stop

# 이미지, 볼륨 제거
npm run docker:prun
```

### 로컬

- **의존성 설치**

```bash
# 모든 서비스의 의존성 설치
npm run install:all
```

- **실행**

```bash
# 모든 서비스 실행
npm run start:dev
```

## API 문서

서버 실행 후 `http://localhost:3000/api/docs` 에서 Swagger API 문서를 확인할 수 있습니다.

## 프로젝트 구조

- **[auth-server](apps/auth-server/README.md)**: 인증 및 사용자 관리 서버 (포트: 3001)

  - 사용자 등록, 로그인, 토큰 갱신, 로그아웃
  - 사용자 활동 로깅 (로그인, 초대 등)
  - 역할 기반 접근 제어 (USER, OPERATOR, AUDITOR, ADMIN)

- **[event-server](apps/event-server/README.md)**: 이벤트 및 보상 관리 서버 (포트: 3002)

  - 이벤트 관리 (생성, 조회, 수정, 삭제)
  - 이벤트 보상 관리
  - 보상 요청 처리
  - 조건부 이벤트 관리 (로그인, 초대, 퀘스트 클리어 등 조건)

- **[gateway-server](apps/gateway-server/README.md)**: API 게이트웨이 서버 (포트: 3000)
  - 모든 HTTP API 엔드포인트 제공
  - 마이크로서비스 간 통신 관리
  - 인증/인가 처리
  - API 문서화 (Swagger)

## 주요 기능

- **인증 시스템**: JWT 기반 인증 (액세스 토큰 + 리프레시 토큰)
- **이벤트 관리**: 이벤트 생성, 조회, 수정, 삭제 (관리자/운영자 전용)
- **조건부 이벤트**: 다양한 조건 유형 지원 (로그인, 퀘스트 완료, 사용자 초대 등)
- **보상 시스템**: 다양한 보상 유형 지원 (포인트, 쿠폰, 아이템 등)
- **사용자 활동 추적**: 사용자 활동 기록 및 조건 검증에 활용
- **역할 기반 접근 제어**: 사용자 권한에 따른 기능 접근 제어

## 관리자 계정

초기 관리자 계정이 자동으로 생성됩니다:

- 이메일: admin@nexon.com
- 비밀번호: password123!

## 아키텍처 및 설계 고민

### 마이크로서비스 아키텍처

- API 게이트웨이 패턴으로 단일 진입점 제공
- TCP를 이용한 요청 송수신
- APM 도구에서 추적을 위한 traceId 생성 및 전파
- filter를 이용해 MSA서버에서 발생한 에러 내용을 Gateway에 전달

### 이벤트-보상 시스템

- 유연한 condition 시스템 (metadata 기반)
- 다양한 보상 유형 지원 (포인트, 쿠폰, 아이템)
- 상태 기반 보상 요청 관리 (요청, 성공, 실패)

### 보안 및 인증

- JWT 기반 액세스 토큰과 리프레시 토큰 분리
- 토큰 블랙리스트로 로그아웃 관리
- 역할 기반 접근 제어 구현

### 고려한 점

- `user-activity`테이블을 분리한 이유
  - 로그성 테이블이라 user에 같이 넣기에는 쓰기가 빈번할 것 으로 예상하여 분리
- Record<string, any> 형태를 이용한 유연한 `user-activity`관리
- Login Activity를 login, register 메서드에서 실행하지 않는 이유
  - Login은 성공하였지만, Login Activity 생성에 실패하는 경우에 로그인 성공을 보장하기 위함
- 확장성을 위한 event와 reward의 분리
- Record<string, any> 형태를 이용한 데이터 `condition.metadata` 관리
- msa 통신 실패를 고려한 `reward-request.status` 필드
- `condition.metadata`과 `user-activity.metadata`의 타입을 각각 정의하고, 비교 로직 구현

### 아쉬운 점

- **트랜잭션 미적용**: 트랜잭션을 적용하지 못한 점이 아쉬움
  - 이벤트 생성과 보상 생성이 원자적으로 처리되지 않음

## 이벤트 예시

```json
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
```

## 주석 전략

- `TODO: ` 해야할 일
- `NOTE: ` 기록용
