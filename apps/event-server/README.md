# event server

## 개요

이벤트 등록, 조회 수정, 보상 추가, 수정, 보상 요청, 보상 요청 내역 조회 기능을 제공합니다.

### 특징

- **Pagination**: 목록 조회시 Pagination 구현

### 고려한 점

- event와 reward의 분리
- Record<string, any> 형태를 이용한 데이터 `condition.metadata` 관리
- msa 통신 실패를 고려한 `reward-request.status` 필드
- `condition.metadata`과 `user-activity.metadata`의 타입을 각각 정의하고, 비교 로직 구현
