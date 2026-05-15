# Recommend Travel Plan

AI 기반 여행 계획 추천 서비스

---

## 프로젝트 구조

```
recommend-travel-plan/
├── app/        # FastAPI 백엔드
└── mobile/     # React Native (Expo) 앱
```

---

## 백엔드 실행 (FastAPI)


### 1. 가상환경 설정 및 실행

```bash
# 가상환경 활성화
.\venv\Scripts\activate

# 서버 실행
uvicorn app.main:app --reload
```

- 서버 주소: `http://localhost:8000`
- API 문서: `http://localhost:8000/docs`

> 서버 최초 실행 시 테이블 자동 생성 및 Preference 카테고리 데이터가 자동으로 삽입됩니다.

---

## 모바일 실행 (React Native / Expo)

### 1. 의존성 설치

```bash
cd mobile
npm install
```

### 2. 앱 실행

```bash
npx expo start
```

실행 후 터미널 QR 코드로 기기에서 실행하거나 아래 단축키를 사용합니다.

| 단축키 | 동작 |
|--------|------|
| `a` | Android 에뮬레이터 실행 |
| `i` | iOS 시뮬레이터 실행 (Mac 전용) |
| `w` | 웹 브라우저 실행 |

---
