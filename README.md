# 🐳 Jaewoogram : Instagram Clone project

- **웹사이트**: [https://www.jaewoo.site](https://www.jaewoo.site)
- **API 엔드포인트**: [https://www.jaewoo.site/api](https://www.jaewoo.site/api)

> GitHub Actions + Docker + EC2 + HTTPS 자동 배포까지 구현한 풀스택 프로젝트

## 📌 목차
- [프로젝트 소개](#-프로젝트-소개)
- [프로젝트 구조](#-프로젝트-구조)
- [배포 흐름 (CI/CD)](#-배포-흐름-cicd)
- [사용 기술](#️-사용-기술)
- [배포 주소](#-배포-주소)
- [로컬 개발 환경 설정](#-로컬-개발-환경-설정)
- [기능 확인](#-기능-확인)
- [보안 참고사항](#-보안-참고사항)
- [커밋 컨벤션](#-커밋-컨벤션)

## 🚀 프로젝트 소개

이 프로젝트는 현대적인 CI/CD 파이프라인을 구축하여 코드 변경 시 자동으로 배포되는 풀스택 웹 애플리케이션입니다. GitHub Actions와 Docker를 활용한 자동화된 빌드 및 배포 프로세스를 구현했으며, AWS 인프라와 HTTPS 보안을 적용했습니다.

**주요 특징:**
- Spring Boot 백엔드 + Next.js 프론트엔드 구성
- GitHub Actions를 통한 자동 CI/CD 파이프라인
- Docker 컨테이너화로 일관된 배포 환경 구성
- HTTPS 보안 적용 및 자동 인증서 갱신
- AWS RDS(MySQL) 및 ElastiCache(Redis) 연동

## 📁 프로젝트 구조

```
.
├── backend/                   # 백엔드 프로젝트
│   └── demo/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/       # Java 소스 코드
│       │   │   └── resources/  # 설정 파일
│       │   │       ├── application.properties          # 공통 설정
│       │   │       ├── application-local.properties    # 로컬 환경 설정
│       │   │       ├── application-prod.properties     # 운영 환경 설정
│       │   │       └── .gitignore                      # application-secret.properties 제외
│       │   └── test/          # 테스트 코드
│       ├── build.gradle       # Gradle 빌드 스크립트
│       └── Dockerfile         # 백엔드 Docker 이미지 정의
│
├── frontend/                  # 프론트엔드 프로젝트
│   └── app/
│       ├── src/              # Next.js 소스 코드
│       ├── public/           # 정적 파일
│       ├── package.json      # NPM 패키지 정의
│       └── Dockerfile        # 프론트엔드 Docker 이미지 정의
│
├── .github/                   # GitHub 설정
│   └── workflows/
│       └── main.yml          # GitHub Actions CI/CD 워크플로우
│
└── README.md                  # 프로젝트 문서
```

## 🔄 배포 흐름 (CI/CD)

GitHub Actions를 통해 `main` 브랜치에 push하면 다음이 자동으로 수행됩니다:

1. **코드 체크아웃 및 환경 설정**
   - GitHub Actions 러너에서 코드를 가져오고 빌드 환경 설정

2. **백엔드 빌드 및 배포**
   - Secret 환경 변수를 통한 설정 파일 생성
   - Gradle을 사용하여 Spring Boot 애플리케이션 빌드
   - Docker 이미지 생성 및 Docker Hub에 푸시

3. **프론트엔드 빌드 및 배포**
   - 환경 변수 설정 및 Next.js 애플리케이션 빌드
   - Docker 이미지 생성 및 Docker Hub에 푸시

4. **EC2 배포**
   - SSH를 통해 EC2 인스턴스에 접속
   - 기존 컨테이너 중지 및 삭제
   - 최신 Docker 이미지 Pull 및 컨테이너 재시작
   - Nginx를 통한 HTTPS 리버스 프록시 설정

5. **자동화된 인증서 관리**
   - Let's Encrypt 인증서 자동 갱신 (cron job)

## ⚙️ 사용 기술

| 영역 | 스택 |
|------|------|
| **백엔드** | Java 17, Spring Boot 3.x, Spring Data JPA, Gradle, MySQL (AWS RDS) |
| **프론트엔드** | Next.js 14, TypeScript, App Router, Tailwind CSS, React Query |
| **CI/CD** | GitHub Actions, Docker, Docker Hub |
| **인프라** | AWS EC2 (Ubuntu), AWS RDS, AWS ElastiCache |
| **웹 서버** | Nginx, Let's Encrypt (HTTPS) |
| **캐싱 & 분산처리** | Redis, Redisson (분산락) |
| **보안** | CORS 설정, HTTPS, 환경 변수 암호화 |

## 🌐 배포 주소

- **웹사이트**: [https://www.jaewoo.site](https://www.jaewoo.site)
- **API 엔드포인트**: [https://www.jaewoo.site/api](https://www.jaewoo.site/api)

## 💻 로컬 개발 환경 설정

### 백엔드

```bash
# 프로젝트 복제
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend/demo

# application-secret.properties 생성 (로컬 개발용)
echo "db.url=jdbc:mysql://localhost:3306/localdb" > src/main/resources/application-secret.properties
echo "db.username=root" >> src/main/resources/application-secret.properties
echo "db.password=password" >> src/main/resources/application-secret.properties
echo "redis.host=localhost" >> src/main/resources/application-secret.properties
echo "redis.port=6379" >> src/main/resources/application-secret.properties

# 애플리케이션 실행
./gradlew bootRun
```

### 프론트엔드

```bash
# 프론트엔드 디렉토리로 이동
cd your-repo/frontend/app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 🧪 기능 확인

- **프론트-백엔드 통신**: 프론트엔드에서 백엔드 API 호출 시 Nginx가 자동으로 HTTPS 프록시 처리
- **자동 배포**: `main` 브랜치에 코드 변경 시 GitHub Actions가 자동으로 빌드 및 배포 수행
- **SSL 인증서**: Let's Encrypt 인증서 자동 갱신 (90일마다)
- **환경별 설정**: 로컬/개발/운영 환경에 따른 설정 분리
- **보안 관리**: 민감한 정보는 GitHub Secrets를 통해 안전하게 관리

## 🔐 보안 참고사항

- 모든 HTTP 트래픽은 자동으로 HTTPS로 리디렉션됩니다.
- 인증서는 Let's Encrypt를 통해 발급받아 Nginx에 적용됩니다.
- 민감한 설정 정보(DB 접속 정보, Redis 설정 등)는 GitHub Secrets를 통해 관리됩니다.
- `application-secret.properties` 파일은 `.gitignore`에 포함되어 있어 실수로 커밋되지 않습니다.
- CORS 설정을 통해 허용된 도메인에서만 API 접근이 가능합니다.

## 📝 커밋 컨벤션

CI/CD 파이프라인을 활용하기 위한 커밋 메시지 컨벤션:

```bash
# 기능 추가
git commit -m "feat: 새로운 기능 추가"

# 버그 수정
git commit -m "fix: 로그인 버그 수정"

# 문서 업데이트
git commit -m "docs: README 업데이트"

# 성능 개선
git commit -m "perf: 쿼리 최적화"

# 리팩토링
git commit -m "refactor: 코드 구조 개선"

# 테스트 추가
git commit -m "test: 유닛 테스트 추가"

# 배포 관련 변경
git commit -m "ci: GitHub Actions 워크플로우 수정"
```

