# CheckOn Backend API

여행 체크리스트 애플리케이션 CheckOn의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Validation**: express-validator

## 📋 API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```
POST /api/auth/sign-up
```

**Request Body:**
```json
{
  "nickname": "사용자닉네임",
  "email": "user@example.com",
  "password": "Password123!",
  "birth": "1990-01-01",
  "gender": "MALE",
  "profile": "https://example.com/photo.jpg" // 선택사항
}
```

**Response:**
```json
{
  "nickname": "사용자닉네임",
  "profile_photo": "https://example.com/photo.jpg"
}
```

**Status Codes:**
| status | response content |
| --- | --- |
| 201 | 회원가입 성공 |
| 400 | 데이터 잘못됨 (e.g. 이메일 형식 오류, 비밀번호 길이 등) |
| 409 | 중복된 이메일, 닉네임 |
| 500 | 서버 오류 |

#### 로그인
```
POST /api/auth/sign-in
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies:**
- `refreshToken`: HttpOnly 쿠키로 저장 (30일 유효)

**Status Codes:**
| status | response content |
| --- | --- |
| 200 | 로그인 성공 |
| 400 | 데이터 잘못됨 (e.g. 이메일 형식 오류, 비밀번호 길이 등) |
| 401 | 이메일 또는 비밀번호가 올바르지 않음 |
| 500 | 서버 오류 |

#### 로그아웃
```
GET /api/auth/sign-out
```

**Response:**
```json
{
  "message": "로그아웃"
}
```

**Status Codes:**
| status | response content |
| --- | --- |
| 200 | 로그아웃 성공 |
| 500 | 서버 오류 |

#### 아이디 찾기
```
POST /api/auth/find-id
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "email": "user@example.com"
}
```

**Status Codes:**
| status | response content |
| --- | --- |
| 200 | 아이디 찾기 성공 |
| 400 | 이메일 형식 오류 |
| 404 | 가입되지 않은 이메일 |
| 500 | 서버 오류 |

#### 비밀번호 변경
```
PUT /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "currentPassword": "current123",
  "newPassword": "newpass123!"
}
```

**Response:**
```json
{
  "message": "비밀번호가 변경되었습니다"
}
```

**Status Codes:**
| status | response content |
| --- | --- |
| 200 | 비밀번호 변경 성공 |
| 400 | 데이터 잘못됨 (이메일 형식, 비밀번호 길이 등) |
| 401 | 현재 비밀번호가 올바르지 않음 |
| 404 | 가입되지 않은 이메일 |
| 500 | 서버 오류 |

### 여행 정보 (Travel Information)

#### 여행 정보 조회
```
GET /api/travel-info
```

**Query Parameters:**
| parameter | 설명 | 필수 | 예시 |
| --- | --- | --- | --- |
| category | 팁 카테고리 | 선택 | "PASSPORT", "ELECTRONICS", "CLOTHING", "DOCUMENTS", "MONEY", "HEALTH", "TRANSPORTATION", "CULTURE" |

**Response:**
```json
{
  "tips": [
    {
      "id": 1,
      "title": "여권 준비",
      "content": "여권은 출발 6개월 전에 유효기간을 확인하고, 최소 6개월 이상 남아있어야 합니다. 여권 사본도 준비해두세요.",
      "category": "PASSPORT",
      "priority": 1
    }
  ]
}
```

**카테고리별 팁:**
- **PASSPORT**: 여권 관련 팁
- **ELECTRONICS**: 전자기기 관련 팁 (돼지코 어댑터, WiFi 등)
- **CLOTHING**: 의류 관련 팁
- **DOCUMENTS**: 서류 관련 팁
- **MONEY**: 금전 관련 팁
- **HEALTH**: 건강 관련 팁
- **TRANSPORTATION**: 교통 관련 팁
- **CULTURE**: 문화 관련 팁

**Status Codes:**
| status | response content |
| --- | --- |
| 200 | 여행 정보 조회 성공 |
| 400 | 잘못된 카테고리 |
| 500 | 서버 오류 |

### 사용자 관리 (User Management)

#### 내 정보 조회
```
GET /api/user/profile
Authorization: Bearer <accessToken>
```

#### 내 정보 수정
```
PUT /api/user/profile
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "nickname": "새닉네임", // 선택사항
  "birthDate": "1990-01-01", // 선택사항
  "gender": "FEMALE", // 선택사항
  "profilePhoto": "https://example.com/new-photo.jpg" // 선택사항
}
```

#### 비밀번호 변경
```
PUT /api/user/password
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호123!",
  "confirmPassword": "새비밀번호123!"
}
```

#### 회원 탈퇴
```
DELETE /api/user/account
Authorization: Bearer <accessToken>
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env
```

`.env` 파일을 편집하여 데이터베이스 연결 정보와 JWT 시크릿을 설정하세요.

### 3. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# 또는 마이그레이션 사용
npm run db:migrate
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📊 데이터베이스 스키마

### User 모델
- `userId`: 사용자 고유 ID
- `nickname`: 닉네임 (고유)
- `email`: 이메일 (고유)
- `password`: 해시화된 비밀번호
- `birthDate`: 생년월일
- `profilePhoto`: 프로필 사진 URL
- `gender`: 성별 (MALE, FEMALE, OTHER)
- `authority`: 권한 (USER, ADMIN)

### 관련 모델
- `Checklist`: 사용자의 체크리스트
- `ItemReview`: 사용자의 아이템 리뷰
- `UserFavoriteItem`: 사용자가 좋아요한 리뷰

## 🔐 보안

- 비밀번호는 bcrypt로 해시화되어 저장됩니다
- JWT 토큰을 사용한 인증
- Access Token: 7일 유효
- Refresh Token: 30일 유효 (HttpOnly 쿠키)
- 입력 데이터 유효성 검사
- SQL 인젝션 방지를 위한 Prisma ORM 사용

## 📝 유효성 검사 규칙

### 회원가입
- **닉네임**: 2-20자, 영문/숫자/한글만 허용
- **이메일**: 유효한 이메일 형식
- **비밀번호**: 8자 이상, 영문/숫자/특수문자 포함
- **생년월일**: ISO 8601 형식
- **성별**: MALE, FEMALE, OTHER 중 하나

### 로그인
- **이메일**: 유효한 이메일 형식
- **비밀번호**: 6-13자

## 🚨 에러 코드

- `400`: 잘못된 요청 (유효성 검사 실패)
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `409`: 중복된 데이터 (이메일, 닉네임)
- `500`: 서버 내부 오류

## 🔧 개발 도구

- **Prisma Studio**: `npm run db:studio`
- **데이터베이스 마이그레이션**: `npm run db:migrate`
- **스키마 적용**: `npm run db:push` 