# 🐳 Jaewoogram : Instagram Clone Project

- **웹사이트**: [https://www.jaewoo.site](https://www.jaewoo.site)
- **API 엔드포인트**: [https://www.jaewoo.site/api](https://www.jaewoo.site/api)

> 실시간 채팅, 알림 시스템, 좋아요/팔로우 기능을 갖춘 인스타그램 클론 프로젝트 (Kafka + Redis + WebSocket 기반 아키텍처 + Elasticsearch 검색 최적화 포함)

## 📌 목차
- [프로젝트 소개](#-프로젝트-소개)
- [핵심 기능 요약](#-핵심-기능-요약)
- [프로젝트 구조](#-프로젝트-구조)
- [배포 흐름 (CI/CD)](#-배포-흐름-cicd)
- [기술 스택](#-기술-스택)
- [아키텍처 개요](#-아키텍처-개요)
- [로컬 개발 환경 설정](#-로컬-개발-환경-설정)
- [보안 참고사항](#-보안-참고사항)
- [커밋 컨벤션](#-커밋-컨벤션)

## 🚀 프로젝트 소개

Jaewoogram은 실시간 사용자 경험과 성능을 고려한 인스타그램 클론 프로젝트입니다. 핵심 기능으로는 실시간 1:1/그룹 채팅, 좋아요 및 댓글 알림 시스템, 게시글 캐싱 및 검색 최적화, 공개/비공개 계정 설정, 팔로우 요청 승인 기능 등을 포함합니다.

## 🌟 핵심 기능 요약

- JWT + OAuth2 로그인 및 사용자 인증
- 게시물 CRUD 및 다중 이미지 업로드/수정
- 댓글 및 대댓글 트리 구조 구현
- 게시물 및 댓글 좋아요 기능 (Redisson 분산락 + Redis 캐싱)
- 팔로우/팔로우 요청/비공개 계정 승인 기능
- 실시간 DM 및 그룹 채팅 (Kafka → Redis PubSub → WebSocket)
- 실시간 알림 시스템 (Kafka 기반 알림 이벤트 처리)
- 닉네임 검색 최적화를 위한 Elasticsearch 연동
- Kafka, Redis, WebSocket을 활용한 고성능 이벤트 기반 아키텍처

## 📁 프로젝트 구조

```
.
├── backend/
│   └── demo/
│       ├── src/main/java/...              # 백엔드 도메인 코드 및 서비스 로직
│       ├── src/main/resources/
│       │   ├── application.yml            # 공통 설정
│       │   ├── application-local.yml      # 로컬 환경 설정
│       │   ├── application-prod.yml       # 운영 환경 설정
│       │   └── application-secret.yml     # 보안 정보 (gitignore)
│       └── Dockerfile
│
├── frontend/
│   └── app/
│       ├── pages/                         # Next.js 라우팅
│       ├── components/                    # UI 컴포넌트
│       ├── lib/                           # API 통신 및 auth
│       ├── public/
│       └── Dockerfile
│
├── .github/workflows/
│   └── main.yml                           # GitHub Actions CI/CD
└── README.md
```

## 🔄 배포 흐름 (CI/CD)

GitHub Actions를 통해 `main` 브랜치에 push 시 다음이 자동 실행됩니다:

1. **환경 설정 및 빌드**
   - Secret 정보 기반으로 application-secret.yml 생성
   - Gradle 및 Next.js 빌드 수행

2. **Docker 이미지 생성 및 푸시**
   - 백엔드/프론트엔드 각각 Docker 이미지 빌드
   - Docker Hub로 푸시

3. **EC2 서버에 배포**
   - SSH로 EC2 접속
   - 기존 컨테이너 종료 및 제거
   - 새 이미지 pull 및 컨테이너 재시작
   - Nginx로 리버스 프록시 및 HTTPS 적용

4. **Let's Encrypt 인증서 자동 갱신 (cron job)**

## 🛠️ 기술 스택

| 영역 | 스택 |
|------|------|
| **백엔드** | Java 17, Spring Boot 3.4.x, Spring Data JPA, Redis, Kafka, Elasticsearch |
| **프론트엔드** | Next.js 14, TypeScript, Tailwind CSS, React Query |
| **DB** | MySQL (AWS RDS), MongoDB (일부 게시글 조회 캐싱) |
| **메시징** | Apache Kafka, Redis Pub/Sub |
| **실시간** | WebSocket (Session 제어 방식), Redis 기반 세션 연결 관리 |
| **검색** | Elasticsearch (닉네임 검색 전용) |
| **CI/CD** | GitHub Actions, Docker, Docker Hub |
| **서버/보안** | AWS EC2, Nginx, Let's Encrypt, HTTPS, JWT 인증, 쿠키 기반 인증 처리 |

## 🧱 아키텍처 개요

```
[Frontend]
   │
   ├── Login / Post / Chat UI (Next.js)
   │
   ▼
[Nginx - HTTPS Reverse Proxy]
   ▼
[Spring Boot API Server]
   ├── RDS (MySQL)         ← 댓글/유저 정보/팔로우 관계
   ├── MongoDB             ← 게시글 빠른 조회용 캐싱
   ├── Redis               ← 좋아요 수, 세션 캐시
   ├── Kafka Producer      ← 채팅 메시지/알림 발행
   ├── Kafka Consumer      ← Redis PubSub로 메시지 전달
   ├── Redis Subscriber    ← WebSocket 사용자 세션으로 전송
   └── Elasticsearch       ← 닉네임 검색 처리
```

## 💻 로컬 개발 환경 설정

### 백엔드

```bash
git clone https://github.com/your-username/jaewoogram.git
cd jaewoogram/backend/demo

# application-secret.yml 생성 (gitignore)
# 필수 항목: DB, Redis, Kafka, Elasticsearch 접속 정보

./gradlew bootRun
```

### 프론트엔드

```bash
cd jaewoogram/frontend/app
npm install
npm run dev
```

## 🔐 보안 참고사항

- 모든 트래픽은 HTTPS로 암호화되어 전달됩니다.
- 인증은 JWT 기반이며, Access Token + Refresh Token 구조입니다.
- HttpOnly + Secure + SameSite 설정된 쿠키로 토큰 전달
- Redis를 이용한 인증 정보 캐싱 및 세션 유지
- application-secret.yml 은 .gitignore 로 커밋 방지
- CORS 정책 설정 및 도메인 화이트리스트 적용

## 📝 커밋 컨벤션

| 타입 | 설명 |
|------|------|
| feat | 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 작성/수정 |
| style | 코드 포맷팅 (기능 변경 없음) |
| refactor | 리팩토링 |
| test | 테스트 코드 추가 |
| ci | CI/CD 관련 설정 변경 |
| chore | 기타 변경사항 |

예시:
```bash
git commit -m "feat: DM 채팅방 생성 API 구현"
git commit -m "fix: 게시물 좋아요 캐싱 오류 수정"
```

---

> 본 프로젝트는 포트폴리오 및 백엔드 아키텍처 실습 목적이며, 배포는 개인 EC2 서버에서 관리되고 있습니다.
