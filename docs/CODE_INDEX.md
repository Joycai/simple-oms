# simple-oms — Code Index

> 最后更新: 2026-05-23 / 维护: @名雪 & @Sakura

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
| `JwtAuthFilter.kt` | OncePerRequestFilter — 拦截请求，验证 access_token，三级缓存权限检查 |
| `CustomUserDetailsService.kt` | UserDetailsService — 从 DB 加载用户，供 Security 认证 |
| `RefreshTokenService.kt` | refresh_token CRUD (Redisson RBucket 存储) |
| `RolePermissionCache.kt` | 三级缓存实现 — Caffeine L1 + Redis L2 + DB L3 |

### 业务 API (`controller/`)
| 文件 | 端点 | 说明 |
|------|------|------|
| `AuthController.kt` | `/api/v1/auth/*` | 注册、登录、刷新、退出、修改密码、OTP、个人资料 |
| `RoleController.kt` | `/api/v1/roles` | 角色 CRUD |
| `AdminController.kt` | `/api/v1/admin/*` | 用户列表、角色分配、权限查询、重置密码 |

### 数据模型 (`model/`)
| 文件 | 表 | 字段 |
|------|-----|------|
| `User.kt` | `users` | id, username, password, email, nickname, phone, enabled, createdAt |
| `Role.kt` | `roles` | id, name, description |
| `Permission.kt` | `permissions` | id, code, module |

### 配置 (`config/`)
| 文件 | 说明 |
|------|------|
| `SecurityConfig.kt` | Spring Security 配置 — 权限路径拦截、CORS 配置 |
| `RedissonConfig.kt` | RedissonClient Bean 配置 |
| `CacheConfig.kt` | Caffeine 本地缓存配置 |
| `DataInitializer.kt` | 启动时初始化 admin 用户、角色及 12 个基础权限 |

---

## Frontend (`frontend/src/`)

### 页面路由 (`app/`)
| 路由 | 文件 | 说明 |
|------|------|------|
| `/login` | `login/page.tsx` | 登录页 — 左右分栏 (The Library Wing) |
| `/register` | `register/page.tsx` | 注册页 — 左右分栏 |
| `/dashboard` | `dashboard/layout.tsx` | Dashboard 通用布局 — 侧边导航 (The Catalog) |
| `/dashboard/users` | `dashboard/users/page.tsx` | 用户管理 — 成员名册 |
| `/dashboard/roles` | `dashboard/roles/page.tsx` | 角色管理 — 职级框架 |
| `/dashboard/permissions` | `dashboard/permissions/page.tsx` | 权限管理 — 权限树钥匙 |
| `/dashboard/profile` | `dashboard/profile/page.tsx` | 个人资料 — 个人书斋 |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | 安全设置 — 密码修改 & 2FA 开启 |

### 组件 (`components/`)
| 文件 | 说明 |
|------|------|
| `AuthGuard.tsx` | 路由守卫 — 增强版 Hydration-safe 鉴权 |
| `LanguageToggle.tsx` | 中/EN 语言切换 |
| `LanguageToggle.tsx` | 2FA QR Code 渲染器 (本地库) |

---

## 基础设施 & 文档

### 基础设施
- **CI/CD**: `.github/workflows/ci.yml` (Build & Lint)
- **Docker**: `docker-compose.yml` (PostgreSQL + Redis)

### 设计与规范文档 (`docs/`)
| 文件 | 版本 | 说明 |
|------|------|------|
| `design-system.md` | v1.1 | 审美理念：“现代图示馆”色彩与字体规范 |
| `layout-spec.md` | v1.2 | 登录页/Dashboard 分栏与分组导航规格 |
| `rbac-ui-spec.md` | v1.1 | 管理页面交互与权限树设计规格 |
| `security-spec.md` | v1.1 | 2FA、恢复码与密码重置安全流程规格 |
| `profile-spec.md` | v1.0 | 个人中心“个人书斋”设计规格 |
