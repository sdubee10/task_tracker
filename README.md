# TaskFlow - 업무 관리 시스템

<div align="center">

![TaskFlow Logo](https://img.shields.io/badge/TaskFlow-v2.0-blue?style=for-the-badge&logo=task&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)

**신청서 기반 업무 관리 및 그래프 데이터베이스를 활용한 관계 시각화 시스템**

[시작하기](#-시작하기) • [기능](#-주요-기능) • [기술 스택](#-기술-스택) • [아키텍처](#-아키텍처) • [데이터베이스](#-데이터베이스-설계)

</div>

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [개발 배경 및 목적](#-개발-배경-및-목적)
3. [주요 기능](#-주요-기능)
4. [기술 스택](#-기술-스택)
5. [아키텍처](#-아키텍처)
6. [데이터베이스 설계](#-데이터베이스-설계)
7. [컴포넌트 시스템](#-컴포넌트-시스템)
8. [화면 구성](#-화면-구성)
9. [시작하기](#-시작하기)
10. [파일 구조](#-파일-구조)
11. [API 참조](#-api-참조)
12. [향후 계획](#-향후-계획)

---

## 📖 프로젝트 개요

**TaskFlow**는 기업 내 다양한 부서 간 업무 요청을 효율적으로 관리하고, 담당자 배정 및 업무 처리 현황을 시각적으로 파악할 수 있는 웹 기반 업무 관리 시스템입니다.

### 핵심 가치

| 가치 | 설명 |
|------|------|
| 🎯 **효율성** | 드래그 앤 드롭 기반의 직관적인 신청서 작성 |
| 📊 **가시성** | 그래프 기반 관계 시각화로 업무 흐름 파악 |
| 📈 **분석력** | 개인/팀별 업무량 및 역량 데이터 분석 |
| 🔄 **유연성** | 다양한 신청서 템플릿 지원 및 커스터마이징 |
| 🎨 **사용자 경험** | 6가지 테마 및 반응형 디자인 지원 |

---

## 🎯 개발 배경 및 목적

### 개발 배경

기업 환경에서 발생하는 다양한 업무 요청(개발 요청, 데이터 추출, 인프라 설정 등)은 각 부서마다 서로 다른 양식과 프로세스를 가지고 있습니다. 이로 인해 다음과 같은 문제점이 발생합니다:

1. **비표준화된 요청 양식**: 부서마다 다른 양식으로 인한 혼란
2. **업무 현황 파악 어려움**: 누가 어떤 업무를 처리 중인지 파악하기 어려움
3. **업무량 불균형**: 특정 담당자에게 업무가 집중되는 현상
4. **데이터 분석 한계**: 업무 처리 현황에 대한 정량적 분석 부재
5. **유연하지 않은 데이터 구조**: 신청서마다 다른 컴포넌트 구성으로 인한 관계형 DB 한계

### 개발 목적

1. **통합 신청서 시스템**: 모든 부서의 요청을 하나의 플랫폼에서 관리
2. **시각적 업무 관리**: 그래프 기반 시각화로 업무 관계 및 현황 파악
3. **데이터 기반 의사결정**: 업무량, 처리 시간, 역량 평가 데이터 제공
4. **유연한 템플릿 시스템**: 각 부서 특성에 맞는 신청서 양식 생성
5. **그래프 데이터베이스 도입**: 신청서별 다양한 컴포넌트 구성을 유연하게 저장

---

## ✨ 주요 기능

### 1. 📝 요청서 빌더 (Form Builder)

드래그 앤 드롭 방식으로 신청서 양식을 자유롭게 설계할 수 있습니다.

#### 지원 컴포넌트 (25종)

| 카테고리 | 컴포넌트 | 설명 |
|----------|----------|------|
| **정보 표시** | 섹션 제목 | 섹션 구분을 위한 헤더 |
| | 구분선 | 시각적 구분을 위한 라인 |
| | 안내 텍스트 | 사용자에게 안내 메시지 표시 |
| | 요청자 정보 | 자동으로 요청자 정보 표시 |
| **기본 입력** | 텍스트 입력 | 단일 라인 텍스트 |
| | 텍스트 영역 | 여러 줄 텍스트 입력 |
| | 숫자 입력 | 숫자 값 입력 |
| | 날짜 선택 | 날짜 선택기 |
| | 선택 (드롭다운) | 단일 선택 드롭다운 |
| | 이메일 입력 | 이메일 형식 입력 |
| **선택 항목** | 체크박스 | 다중 선택 |
| | 라디오 버튼 | 단일 선택 |
| | 우선순위 선택 | 긴급/높음/보통/낮음 |
| **파일/승인** | 파일 첨부 | 파일 업로드 |
| | 결재 라인 | 결재 단계 설정 |
| **평가 항목** | 별점 평가 | 1~5점 별점 |
| | 슬라이더 | 범위 값 선택 |
| | 역량 평가 | 다중 역량 평가 |
| | 만족도 평가 | 이모지 기반 평가 |
| | 진행률 입력 | 퍼센트 진행률 |
| **특수 입력** | 부서 선택 | 부서 드롭다운 |
| | 프로젝트 선택 | 프로젝트 드롭다운 |
| | 마감일 입력 | 마감일 선택 |
| | 이미지 업로드 | 이미지 파일 업로드 |

#### 기본 제공 템플릿 (30종)

| 카테고리 | 템플릿 수 | 주요 템플릿 |
|----------|-----------|-------------|
| **DBA** | 4개 | 데이터 추출, 테이블/컬럼 변경, 쿼리 최적화, 백업/복구 |
| **Frontend** | 4개 | 화면 개발, UI/UX 개선, 반응형 작업, 컴포넌트 개발 |
| **Backend** | 4개 | API 개발, 배치 작업, 성능 개선, 시스템 연동 |
| **Infra** | 4개 | 서버 증설, 도메인 등록, 모니터링 설정, 배포 요청 |
| **공통** | 4개 | 일반 업무 요청, 회의실 예약, 출장 신청, 교육 신청 |
| **QA** | 4개 | 테스트 요청, 버그 리포트, 성능 테스트, 회귀 테스트 |
| **보안** | 3개 | 보안 점검, 취약점 분석, 권한 신청 |
| **기획** | 3개 | 기획서 검토, 요구사항 분석, 일정 협의 |

#### 템플릿 관리 기능

- **추천 템플릿**: 상단에 10개 주요 템플릿 표시
- **기타 템플릿**: 카테고리별로 분류된 20개 템플릿 (접기/펼치기)
- **내 템플릿**: 사용자가 생성한 커스텀 템플릿 관리 (4열 그리드)
- **미리보기**: 작성 중인 신청서 실시간 미리보기
- **저장**: 템플릿 이름, 설명, 카테고리 설정 후 저장

### 2. 📋 신청서 작성 및 관리

#### 3단계 신청서 작성 프로세스

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Step 1    │────▶│   Step 2    │────▶│   Step 3    │
│ 템플릿 선택  │     │  내용 작성   │     │ 검토 및 제출 │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. **템플릿 선택**: 카테고리별 탭으로 템플릿 필터링 및 선택
   - 전체 / 내 템플릿 / DBA / Frontend / Backend / Infra / 공통 / QA / 보안 / 기획 / 기타
2. **내용 작성**: 동적으로 생성된 폼에 정보 입력
3. **검토 및 제출**: 입력 내용 확인 후 제출

#### 신청서 관리 기능

- 상태별 필터링 (전체, 제출됨, 처리 중, 완료, 반려, 임시저장)
- 키워드 검색
- 상세 정보 조회 및 수정
- 임시저장 기능

### 3. 🔗 신청서 관계 그래프

그래프 데이터베이스 기반으로 신청서와 담당자 간의 관계를 시각화합니다.

#### 레이아웃 옵션 (6종)

| 레이아웃 | 설명 | 용도 |
|----------|------|------|
| 🔓 자유 | 노드를 자유롭게 배치 | 수동 정렬 |
| 📊 계층형 | 상하 계층 구조로 배치 | 조직도 형태 |
| 🔵 원형 | 원형으로 노드 배치 | 전체 관계 파악 |
| 📐 그리드 | 격자 형태로 정렬 | 깔끔한 정렬 |
| 🏢 부서별 | 부서 기준으로 그룹화 | 부서별 업무 파악 |
| 📋 상태별 | 처리 상태별로 그룹화 | 진행 현황 파악 |

#### 인터랙션

- 노드 드래그로 위치 조정
- 마우스 휠로 줌 인/아웃
- 패닝 (화면 이동)
- 노드 클릭 시 상세 정보 패널 표시
- 노드 타입별 필터링

### 4. 📊 업무 분석 대시보드

#### 제공 통계

| 항목 | 내용 |
|------|------|
| **요약 카드** | 총 신청서 수, 완료율, 평균 처리 시간, 대기 중 건수 |
| **카테고리별 분포** | 도넛 차트로 카테고리별 신청서 비율 |
| **우선순위별 현황** | 바 차트로 우선순위별 건수 |
| **팀별 완료율** | 팀별 업무 처리 성과 비교 |
| **월별 추이** | 라인 차트로 월별 신청서 추이 |

#### 분석 탭

1. **전체 현황**: 종합 통계 대시보드
2. **업무량 분석**: 개인별/팀별 업무량 분석
3. **팀별 통계**: 팀 성과 비교 분석

### 5. 🔐 인증 시스템

- 이메일/비밀번호 로그인
- 세션 관리 (SessionStorage)
- 로그인 상태 유지
- 데모 계정 제공

**데모 계정:**

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@taskflow.com | admin123 |
| 매니저 | manager@taskflow.com | manager123 |
| 사용자 | user@taskflow.com | user123 |

### 6. 🎨 테마 시스템

6가지 테마를 지원하며, 사용자 설정은 LocalStorage에 저장됩니다.

| 테마 | 설명 | 특징 |
|------|------|------|
| 🌙 Dark | 어두운 배경 | 눈의 피로 감소 (기본값) |
| ☀️ Light | 밝은 배경 | 전통적인 UI |
| 🌊 Ocean | 파란 계열 | 차분한 분위기 |
| 🌲 Forest | 초록 계열 | 자연 친화적 |
| 🌅 Sunset | 주황/핑크 계열 | 따뜻한 느낌 |
| 💜 Purple | 보라 계열 | 세련된 분위기 |

---

## 🛠 기술 스택

### Frontend

| 기술 | 용도 | 버전 |
|------|------|------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | 마크업 | 5 |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | 스타일링 | 3 |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | 로직 구현 | ES6+ |
| ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white) | 차트 시각화 | 4.x |
| ![SVG](https://img.shields.io/badge/SVG-FFB13B?style=flat&logo=svg&logoColor=black) | 그래프 렌더링 | - |

### CSS 기능

| 기능 | 설명 |
|------|------|
| **CSS Variables** | 테마 시스템을 위한 커스텀 속성 |
| **Flexbox/Grid** | 반응형 레이아웃 |
| **Transitions** | 부드러운 애니메이션 |
| **Gradients** | 버튼 및 배경 그라데이션 |
| **Box Shadow** | 깊이감 있는 UI |

### Architecture & Patterns

| 패턴 | 설명 |
|------|------|
| **SPA (Single Page Application)** | 해시 기반 라우팅으로 페이지 전환 없이 뷰 변경 |
| **MVP (Model-View-Presenter)** | 관심사 분리를 통한 유지보수성 향상 |
| **Component-Based** | 재사용 가능한 UI 컴포넌트 설계 |
| **Iframe Integration** | 독립적인 페이지를 SPA 내에서 통합 |

### Data Storage

| 저장소 | 용도 |
|--------|------|
| **LocalStorage** | 사용자 데이터, 신청서, 템플릿, 테마 설정 저장 |
| **SessionStorage** | 세션 정보 관리 |
| **Graph Database (Client)** | 노드/엣지 기반 관계 데이터 관리 |

### Design System

| 항목 | 내용 |
|------|------|
| **테마** | 6가지 테마 지원 (다크, 라이트, 오션, 포레스트, 선셋, 퍼플) |
| **폰트** | Noto Sans KR, JetBrains Mono |
| **아이콘** | SVG 인라인 아이콘 |
| **반응형** | 모바일, 태블릿, 데스크톱 대응 |
| **그리드** | 2열/4열 반응형 그리드 시스템 |

---

## 🏗 아키텍처

### SPA 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        app.html                              │
│  ┌─────────────┐  ┌─────────────────────────────────────┐   │
│  │   Sidebar   │  │           Main Content              │   │
│  │             │  │  ┌─────────────────────────────┐    │   │
│  │  - Dashboard│  │  │                             │    │   │
│  │  - Requests │  │  │     Dynamic View Render     │    │   │
│  │  - Form     │  │  │     or Iframe Embed         │    │   │
│  │  - Builder  │  │  │                             │    │   │
│  │  - Analytics│  │  │   (Dashboard / Requests /   │    │   │
│  │  - Graph    │  │  │    Form / Builder / Graph)  │    │   │
│  │             │  │  │                             │    │   │
│  └─────────────┘  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 라우팅 시스템

```javascript
// Hash-based routing
#/dashboard     → Dashboard View (직접 렌더링)
#/requests      → Requests List View (직접 렌더링)
#/request-form  → Request Form View (iframe: request-form.html)
#/form-builder  → Form Builder View (iframe: form-builder.html)
#/analytics     → Analytics Dashboard (iframe: analytics-dashboard.html)
#/graph         → Request Graph View (iframe: request-graph.html)
```

### MVP 패턴 구조

```
┌─────────────────────────────────────────────────────────────┐
│                         Presenter                            │
│  - 비즈니스 로직 처리                                         │
│  - Model과 View 연결                                         │
│  - 사용자 입력 처리                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐
│       Model         │   │        View         │
│  - 데이터 관리       │   │  - UI 렌더링        │
│  - 그래프 DB 연산    │   │  - 이벤트 바인딩    │
│  - 데이터 분석       │   │  - DOM 조작         │
└─────────────────────┘   └─────────────────────┘
```

### Iframe 통신 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     app.html (Parent)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    LocalStorage                       │   │
│  │  - formTemplates (커스텀 템플릿)                       │   │
│  │  - graphDB (그래프 데이터)                             │   │
│  │  - userSettings (사용자 설정)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│            ┌──────────────┼──────────────┐                  │
│            │              │              │                  │
│            ▼              ▼              ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ form-builder│  │request-form │  │request-graph│         │
│  │   iframe    │  │   iframe    │  │   iframe    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  * storage 이벤트와 focus 이벤트로 데이터 동기화             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 데이터베이스 설계

### 그래프 데이터베이스 구조

TaskFlow는 관계 중심의 데이터를 효율적으로 관리하기 위해 그래프 데이터베이스 구조를 채택했습니다. 각 신청서마다 다른 컴포넌트 구성을 가질 수 있어, 관계형 DB의 고정 스키마 한계를 극복합니다.

#### 노드 타입 (Node Types)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │     │   Member    │     │    Team     │
│  (신청서)   │────▶│  (담당자)   │────▶│    (팀)     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   ▼
       │                   │            ┌─────────────┐
       │                   │            │ Department  │
       │                   └───────────▶│   (부서)    │
       │                                └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Evaluation  │     │  Activity   │
│   (평가)    │     │ (활동로그)  │
└─────────────┘     └─────────────┘
```

| 노드 타입 | 설명 | 주요 속성 |
|-----------|------|-----------|
| `request` | 신청서 | id, title, status, priority, category, templateId, formData, components |
| `member` | 담당자 | id, name, department, team, role, email |
| `team` | 팀 | id, name, departmentId |
| `department` | 부서 | id, name |
| `evaluation` | 평가 | technical, communication, efficiency, quality |
| `activity` | 활동 로그 | nodeId, type, details, timestamp |

#### 엣지 타입 (Edge Types)

| 엣지 타입 | 방향 | 설명 |
|-----------|------|------|
| `ASSIGNED_TO` | Request → Member | 담당자 배정 |
| `REQUESTED_BY` | Request → Member | 요청자 |
| `BELONGS_TO` | Member → Team | 팀 소속 |
| `PART_OF` | Team → Department | 부서 소속 |
| `EVALUATED_BY` | Request → Evaluation | 평가 연결 |
| `LOGGED` | Node → Activity | 활동 기록 |

#### 인덱스

빠른 조회를 위한 인덱스 구조:

```javascript
nodeIndex: {
    byType: Map<type, Set<nodeId>>,        // 노드 타입별 인덱스
    byUser: Map<userId, Set<nodeId>>,      // 사용자별 인덱스
    byTemplate: Map<templateId, Set<nodeId>>, // 템플릿별 인덱스
    byStatus: Map<status, Set<nodeId>>,    // 상태별 인덱스
    byDate: Map<date, Set<nodeId>>         // 날짜별 인덱스
}
```

### 신청서 데이터 구조

각 신청서는 템플릿의 컴포넌트 구성에 따라 유연하게 데이터를 저장합니다:

```javascript
{
    id: "req_20241209_abc123",
    type: "request",
    data: {
        templateId: "sample_dba_001",
        templateName: "데이터 추출 요청서",
        category: "DBA",
        status: "submitted",
        priority: "high",
        requesterId: "user_001",
        assigneeId: "user_002",
        formData: {
            // 컴포넌트별 입력 데이터
            "dba1_7": "2024년 1분기 매출 데이터 추출",
            "dba1_8": "보고서 작성",
            "dba1_9": "Excel (.xlsx)",
            "dba1_10": "마케팅팀 분석용 매출 데이터...",
            // ... 템플릿에 따라 다른 필드들
        },
        components: [
            // 템플릿의 컴포넌트 정의 복사
        ]
    },
    createdAt: "2024-12-09T10:30:00.000Z",
    updatedAt: "2024-12-09T10:30:00.000Z"
}
```

### 관계형 데이터베이스 스키마 (참고용)

백엔드 연동 시 사용할 수 있는 SQL 스키마가 `database/` 폴더에 포함되어 있습니다.

**주요 테이블:**
- `users` - 사용자 정보
- `departments` / `teams` - 조직 구조
- `form_templates` / `template_components` - 템플릿 정의
- `requests` / `request_field_values` - 신청서 데이터
- `request_assignees` - 담당자 배정
- `request_evaluations` - 평가 데이터

---

## 🧩 컴포넌트 시스템

### 컴포넌트 팔레트 구조

요청서 빌더의 컴포넌트 팔레트는 다음과 같이 구성됩니다:

```
┌─────────────────────────────────────┐
│ 📌 정보 표시                         │
│   • 섹션 제목                        │
│   • 구분선                           │
│   • 안내 텍스트                      │
│   • 요청자 정보                      │
├─────────────────────────────────────┤
│ 📝 기본 입력                         │
│   • 텍스트 입력                      │
│   • 텍스트 영역                      │
│   • 숫자 입력                        │
│   • 날짜 선택                        │
│   • 선택 (드롭다운)                  │
│   • 이메일 입력                      │
├─────────────────────────────────────┤
│ ☑️ 선택 항목                         │
│   • 체크박스                         │
│   • 라디오 버튼                      │
│   • 우선순위 선택                    │
├─────────────────────────────────────┤
│ 📎 파일/승인                         │
│   • 파일 첨부                        │
│   • 결재 라인                        │
├─────────────────────────────────────┤
│ ⭐ 평가 항목                         │
│   • 별점 평가                        │
│   • 슬라이더                         │
│   • 역량 평가                        │
│   • 만족도 평가                      │
│   • 진행률 입력                      │
├─────────────────────────────────────┤
│ 🔧 특수 입력                         │
│   • 부서 선택                        │
│   • 프로젝트 선택                    │
│   • 마감일 입력                      │
│   • 이미지 업로드                    │
└─────────────────────────────────────┘
```

### 기본 포함 컴포넌트

새 신청서 작성 시 자동으로 포함되는 컴포넌트:

1. **제목 컴포넌트** (최상단) - 신청서 제목 입력
2. **요청자 정보** (제목 아래) - 요청자 정보 자동 표시

### 컴포넌트 속성

각 컴포넌트는 다음과 같은 공통 속성을 가집니다:

| 속성 | 설명 | 예시 |
|------|------|------|
| `id` | 고유 식별자 | `comp_abc123` |
| `type` | 컴포넌트 타입 | `text-input`, `select` |
| `label` | 레이블 텍스트 | `요청 제목` |
| `placeholder` | 플레이스홀더 | `예: 데이터 추출 요청` |
| `required` | 필수 여부 | `true` / `false` |
| `colSpan` | 열 너비 | `1`, `2`, `full` |

---

## 🖥 화면 구성

### 1. 로그인 화면

![Login](https://img.shields.io/badge/Route-/login.html-blue)

- 이메일/비밀번호 입력
- 데모 계정 빠른 로그인
- 소셜 로그인 (데모)
- 다크 테마 적용

### 2. 대시보드

![Dashboard](https://img.shields.io/badge/Route-%23/dashboard-blue)

- 통계 카드 (총 신청서, 완료, 처리 중, 대기)
- 카테고리별 분포 차트
- 상태별 현황 차트
- 최근 신청서 목록
- 빠른 작업 버튼

### 3. 신청서 목록

![Requests](https://img.shields.io/badge/Route-%23/requests-blue)

- 전체 신청서 리스트
- 상태별 필터 탭
- 검색 기능
- 상세 정보 조회

### 4. 신청서 작성

![Request Form](https://img.shields.io/badge/Route-%23/request--form-blue)

- Step 1: 템플릿 선택 (카테고리별 탭 필터링)
- Step 2: 폼 작성 (동적 컴포넌트 렌더링)
- Step 3: 검토 및 제출
- 내 템플릿 / 기본 템플릿 구분 표시

### 5. 요청서 빌더

![Form Builder](https://img.shields.io/badge/Route-%23/form--builder-blue)

- 컴포넌트 팔레트 (드래그 앤 드롭)
- 캔버스 영역 (실시간 미리보기)
- 속성 패널 (컴포넌트 설정)
- 추천 템플릿 (상단 10개)
- 기타 템플릿 (카테고리별 분류, 접기/펼치기)
- 내 템플릿 관리 (4열 그리드)

### 6. 업무 분석

![Analytics](https://img.shields.io/badge/Route-%23/analytics-blue)

- 전체 현황 탭
- 업무량 분석 탭
- 팀별 통계 탭
- Chart.js 기반 시각화

### 7. 신청서 관계 그래프

![Graph](https://img.shields.io/badge/Route-%23/graph-blue)

- SVG 기반 노드 시각화
- 6가지 레이아웃 옵션 (상단 탭)
- 줌/패닝 컨트롤
- 노드 상세 정보 패널
- 노드 타입별 필터링

---

## 🚀 시작하기

### 요구사항

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- Python 3.x (로컬 서버용) 또는 다른 HTTP 서버

### 설치 및 실행

```bash
# 1. 프로젝트 클론 또는 다운로드
git clone <repository-url>
cd task_tracker_v2

# 2. 로컬 서버 실행
python3 -m http.server 8080
# 또는
npx serve -p 8080

# 3. 브라우저에서 접속
# http://localhost:8080/login.html
```

### 접속 URL

| 페이지 | URL |
|--------|-----|
| 로그인 | http://localhost:8080/login.html |
| SPA 앱 | http://localhost:8080/app.html |
| 대시보드 | http://localhost:8080/app.html#/dashboard |
| 신청서 목록 | http://localhost:8080/app.html#/requests |
| 신청서 작성 | http://localhost:8080/app.html#/request-form |
| 요청서 빌더 | http://localhost:8080/app.html#/form-builder |
| 업무 분석 | http://localhost:8080/app.html#/analytics |
| 관계 그래프 | http://localhost:8080/app.html#/graph |

### 독립 실행 페이지

개별 기능만 사용하려면 아래 URL로 직접 접속할 수 있습니다:

- 요청서 빌더: http://localhost:8080/form-builder.html
- 신청서 작성: http://localhost:8080/request-form.html
- 관계 그래프: http://localhost:8080/request-graph.html
- 분석 대시보드: http://localhost:8080/analytics-dashboard.html

---

## 📁 파일 구조

```
task_tracker_v2/
├── 📄 app.html                 # SPA 메인 엔트리 포인트
├── 📄 login.html               # 로그인 페이지
├── 📄 index.html               # 레거시 대시보드 (app.html로 리다이렉트)
├── 📄 form-builder.html        # 요청서 빌더 (독립 실행 가능)
├── 📄 request-form.html        # 신청서 작성 (독립 실행 가능)
├── 📄 request-graph.html       # 관계 그래프 (독립 실행 가능)
├── 📄 analytics-dashboard.html # 분석 대시보드 (독립 실행 가능)
│
├── 📁 css/                     # 스타일시트
│   ├── base.css               # 기본 스타일, CSS 변수, 테마
│   ├── components.css         # 공통 컴포넌트 스타일 (버튼, 모달, 폼)
│   ├── spa.css                # SPA 레이아웃 스타일
│   ├── dashboard.css          # 대시보드 스타일
│   ├── form-builder.css       # 요청서 빌더 스타일
│   ├── request-form.css       # 신청서 작성 스타일
│   ├── request-graph.css      # 관계 그래프 스타일
│   ├── analytics.css          # 분석 대시보드 스타일
│   ├── login.css              # 로그인 페이지 스타일
│   ├── requests.css           # 신청서 목록 스타일
│   └── tasks.css              # 업무 목록 스타일
│
├── 📁 js/                      # JavaScript 모듈
│   ├── spa-app.js             # SPA 앱 컨트롤러
│   ├── spa-router.js          # 해시 기반 라우터
│   ├── spa-views.js           # 뷰 컴포넌트 정의 (iframe 통합)
│   ├── templates-data.js      # 30개 신청서 템플릿 데이터
│   ├── graph-db.js            # 클라이언트 그래프 데이터베이스
│   ├── auth.js                # 인증 유틸리티
│   ├── auth-check.js          # 인증 체크 미들웨어
│   ├── login.js               # 로그인 로직
│   ├── request-graph.js       # 그래프 시각화 로직
│   ├── request-form.js        # 신청서 작성 로직
│   ├── requests.js            # 신청서 목록 로직
│   ├── analytics.js           # 분석 대시보드 로직
│   └── utils.js               # 유틸리티 함수
│
├── 📁 database/                # 데이터베이스 스키마
│   ├── schema.sql             # 관계형 DB 스키마
│   ├── schema_graph.sql       # 그래프 DB 스키마
│   ├── seed_data.sql          # 샘플 데이터 (관계형)
│   ├── seed_graph_data.sql    # 샘플 데이터 (그래프)
│   ├── models.js              # JavaScript 모델 클래스
│   └── README.md              # DB 문서
│
├── 📁 src/                     # MVP 구조 소스
│   ├── main.js                # 앱 진입점
│   ├── models/
│   │   └── GraphDatabase.js   # 그래프 DB 모델
│   ├── views/
│   │   └── RequestGraphView.js
│   ├── presenters/
│   │   └── RequestGraphPresenter.js
│   └── utils/
│
├── 📄 form-builder.js          # 요청서 빌더 스크립트
├── 📄 app.js                   # 레거시 앱 스크립트
└── 📄 README.md                # 프로젝트 문서
```

---

## 📚 API 참조

### Graph Database API

```javascript
// 인스턴스 생성
const graphDB = new GraphDatabase();

// ===== 노드 관리 =====

// 노드 생성
const node = graphDB.createNode('request', {
    templateId: 'sample_dba_001',
    title: '데이터 추출 요청',
    status: 'submitted',
    priority: 'high',
    formData: { ... }
});

// 노드 조회
const node = graphDB.getNode(nodeId);

// 노드 업데이트
graphDB.updateNode(nodeId, { status: 'completed' });

// 노드 삭제
graphDB.deleteNode(nodeId);

// 타입별 노드 조회
const requests = graphDB.getNodesByType('request');

// ===== 엣지(관계) 관리 =====

// 엣지 생성
graphDB.createEdge(requestId, memberId, 'ASSIGNED_TO', {
    assignedAt: new Date().toISOString()
});

// 연결된 노드 조회
const assignees = graphDB.getConnectedNodes(requestId, 'ASSIGNED_TO');

// ===== 분석 함수 =====

// 사용자 업무량 분석
const workload = graphDB.analyzeUserWorkload(userId);

// 담당자 성과 분석
const performance = graphDB.analyzeAssigneePerformance(assigneeId);

// 팀 통계
const stats = graphDB.getTeamStatistics(teamId);

// ===== 데이터 저장/로드 =====

// LocalStorage에 저장
graphDB.save();

// LocalStorage에서 로드
graphDB.load();
```

### Router API

```javascript
// 라우터 인스턴스
const router = new SPARouter();

// 라우트 등록
router.register('/dashboard', {
    render: (container) => { /* 렌더링 로직 */ },
    title: '대시보드'
});

// 네비게이션
router.navigate('/requests');
router.back();
router.forward();

// 가드 설정
router.setBeforeEach((to, from) => {
    // 인증 체크 등
    return true; // false 반환 시 네비게이션 취소
});

router.setAfterEach((to, from) => {
    // 네비게이션 완료 후 처리
});

// 라우터 초기화
router.ready();
router.handleRoute();
```

### Template Data API

```javascript
// 템플릿 목록 조회
const templates = sampleTemplates;

// 카테고리별 필터링
const dbaTemplates = templates.filter(t => t.category === 'DBA');

// 커스텀 템플릿 저장
const customTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
customTemplates.push(newTemplate);
localStorage.setItem('formTemplates', JSON.stringify(customTemplates));
```

---

## 📈 향후 계획

### 단기 계획 (v2.1)

- [ ] 실시간 알림 시스템
- [ ] 신청서 댓글 기능
- [ ] 파일 첨부 기능 완성
- [ ] 모바일 최적화 개선
- [ ] 다국어 지원 (영어)

### 중기 계획 (v3.0)

- [ ] 백엔드 API 서버 구축 (Node.js/Express)
- [ ] 실제 데이터베이스 연동 (PostgreSQL + Neo4j)
- [ ] 사용자 권한 관리 시스템
- [ ] 리포트 생성 및 내보내기 (PDF, Excel)
- [ ] 이메일 알림 연동

### 장기 계획 (v4.0)

- [ ] 실시간 협업 기능 (WebSocket)
- [ ] AI 기반 업무 배정 추천
- [ ] 슬랙/Teams 연동
- [ ] 모바일 앱 개발 (React Native)
- [ ] 워크플로우 자동화

---

## 🐛 알려진 이슈 및 해결

| 이슈 | 상태 | 해결 방법 |
|------|------|-----------|
| Iframe 간 데이터 동기화 지연 | ✅ 해결 | storage/focus 이벤트 리스너 추가 |
| 커스텀 템플릿 카테고리 필터링 | ✅ 해결 | isCustom 플래그 및 필터 로직 수정 |
| 새 탭에서 페이지 열림 | ✅ 해결 | SPA 라우팅 및 iframe 통합 |
| 버튼 디자인 불일치 | ✅ 해결 | CSS 스타일 통일 |

---

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👥 개발팀

| 역할 | 담당 |
|------|------|
| 기획 | TaskFlow Team |
| 프론트엔드 | TaskFlow Team |
| 디자인 | TaskFlow Team |

---

## 📞 문의

- 이슈 등록: GitHub Issues
- 이메일: support@taskflow.com

---

<div align="center">

**Made with ❤️ by TaskFlow Team**

[⬆ 맨 위로](#taskflow---업무-관리-시스템)

</div>
