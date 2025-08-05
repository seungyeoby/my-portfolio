# CheckOn Backend Setup Instructions

## 새로운 기능 업데이트 후 설정 가이드

### 1. 최신 코드 가져오기
```bash
git pull origin dev
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Prisma 클라이언트 재생성
```bash
npx prisma generate
```

### 4. 데이터베이스 마이그레이션 실행
```bash
npx prisma migrate dev
```

### 5. 환경 변수 확인
`.env` 파일에 다음 내용이 있는지 확인:
```
DATABASE_URL="mysql://username:password@localhost:3306/checkon_db"
JWT_SECRET="your-secret-key"
SECRET_KEY="your-secret-key"
```

### 6. 서버 실행
```bash
npm run dev
```

## 추가된 기능들

### Auth1 모듈 확장
- **로그아웃**: `POST /auth/sign-out`
- **이메일 찾기**: `POST /auth/find-id`
- **비밀번호 재설정**: `POST /auth/reset-password`

### 데이터베이스 변경사항
- `PackingBag` enum 추가
- 새로운 마이그레이션 파일 생성

### 에러 처리
- 영어 에러 메시지로 변경
- `UserInfoNotFound` 에러 추가

## 문제 해결

### 오류가 발생하는 경우:
1. `npx prisma migrate reset --force` (데이터 초기화)
2. `npx prisma migrate dev` (마이그레이션 재실행)
3. `npx prisma generate` (클라이언트 재생성)

### 포트 충돌 시:
- 기본 포트: 5001
- 환경 변수에서 PORT 설정 확인 