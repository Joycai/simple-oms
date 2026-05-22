# simple-oms — Code Index

> 最后更新: 2026-05-22 / 维护: @名雪

按功能模块索引代码位置，方便快速定位。

---

## Backend (`backend/src/main/kotlin/com/joycai/simpleoms/`)

### 应用入口
| 文件 | 说明 |
|------|------|
| `SimpleOmsApplication.kt` | Spring Boot 启动类 |

### 认证 & 安全 (`security/`)
| 文件 | 说明 |
|------|------|
| `JwtUtil.kt` | JWT 生成/验证 (access_token + refresh_token) |
| `JwtAuthFilter.kt` | OncePerRequestFilter — 拦截请求，验证 access_token，检查黑名单 |
| `CustomUserDetailsService.kt` | UserDetailsService — 从 DB 加载用户，供 Security 认证 |
| `RefreshTokenService.kt` | refresh_token CRUD (Redisson RBucket 存储) |

### 用户 & 认证 API (`controller/`)
| 文件 | 端点 |
|------|------|
| `AuthController.kt` | `POST /api/v1/auth/register` — 注册 |
| | `POST /api/v1/auth/login` — 登录 → 双 token |
| | `POST /api/v1/auth/refresh` — 刷新 access_token |
| | `POST /api/v1/auth/logout` — 登出 (黑名单 access_token) |

### 数据模型 (`model/`)
| 文件 | 表 | 字段 |
|------|-----|------|
| `User.kt` | `users` | id, username, password(BCrypt), email, enabled, createdAt |

### DTO (`dto/`)
| 文件 | 用途 |
|------|------|
| `LoginRequest.kt` | `{ username, password }` |
| `LoginResponse.kt` | `{ accessToken, refreshToken, username }` |
| `RegisterRequest.kt` | `{ username, password, email? }` |
| `RefreshTokenRequest.kt` | `{ refreshToken }` |

### 数据访问 (`repository/`)
| 文件 | 说明 |
|------|------|
| `UserRepository.kt` | JpaRepository — findByUsername, existsByUsername |

### 配置 (`config/`)
| 文件 | 说明 |
|------|------|
| `SecurityConfig.kt` | Spring Security 配置 — 放行 `/api/v1/auth/**`，启用 JWT filter |
| `RedissonConfig.kt` | RedissonClient Bean 配置 |
| `DataInitializer.kt` | 启动时创建 admin 种子用户 |
| `GlobalExceptionHandler.kt` | 全局异常处理 → 统一错误响应格式 |

### 测试
| 文件 | 说明 |
|------|------|
| `backend/src/test/kotlin/.../SimpleOmsApplicationTests.kt` | 应用上下文加载测试 |

---

## Frontend (`frontend/src/`)

### 页面路由 (`app/`)
| 路由 | 文件 | 说明 |
|------|------|------|
| `/` | `page.tsx` | 首页 — 重定向到 /login 或 /dashboard |
| `/login` | `login/page.tsx` | 登录页 — 左右分栏，Material Design 表单 |
| `/register` | `register/page.tsx` | 注册页 — 左右分栏，用户名+邮箱+密码+确认密码 |
| `/dashboard` | `dashboard/page.tsx` | Dashboard — 侧边导航+工作区布局 |
| (全局) | `layout.tsx` | 根布局 — I18nProvider + 字体 + 全局样式 |

### 组件 (`components/`)
| 文件 | 说明 |
|------|------|
| `AuthGuard.tsx` | 路由守卫 — 未登录→/login，token 自动刷新 |
| `LanguageToggle.tsx` | 中/EN 语言切换按钮 |
| `ui/button.tsx` | shadcn/ui Button 组件 (自动生成) |

### 工具库 (`lib/`)
| 文件 | 说明 |
|------|------|
| `auth.ts` | Token 存储/读取/清除，API 请求拦截器 (401 自动 refresh) |
| `i18n.tsx` | I18nProvider — zh-CN / en-US，localStorage 持久化 |
| `utils.ts` | 通用工具函数 |

---

## 基础设施

### Docker Compose
| 服务 | 镜像 | 端口 |
|------|------|------|
| `postgres` | postgres:16-alpine | 5432 |
| `redis` | redis:7-alpine | 6379 |

### CI/CD
| 文件 | 说明 |
|------|------|
| `.github/workflows/ci.yml` | GitHub Actions — 后端 Gradle build + 前端 npm build |

### 配置文件
| 文件 | 说明 |
|------|------|
| `backend/build.gradle.kts` | Gradle 依赖 (Spring Boot 4.0.6, Redisson, JPA, Security, ...) |
| `backend/src/main/resources/application.yml` | 数据库/Redis/CORS 配置 |
| `frontend/package.json` | npm 依赖 (Next.js 16, shadcn/ui, zustand, ...) |
| `frontend/next.config.ts` | Next.js 配置 |

### 设计文档
| 文件 | 说明 |
|------|------|
| `docs/design-system.md` | 视觉风格标准 v1.1 |
| `docs/layout-spec.md` | 登录页/Dashboard 布局规格 |
| `docs/CODE_INDEX.md` | 本文件 — 代码索引 |
