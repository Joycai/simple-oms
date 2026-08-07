# simple-oms — Code Index

> 最后更新: 2026-08-07

按功能模块索引代码位置，方便快速定位。

---

## Backend (`backend/`)

### 1. IAM Service (`backend/iam-service/src/main/kotlin/com/joycai/simpleoms/`)
端口: 8080 | 数据库: PostgreSQL (`simple_oms`:5432) | 缓存: Redis (:6379)

#### 应用入口
| 文件 | 说明 |
|------|------|
| `SimpleOmsApplication.kt` | IAM 服务 Spring Boot 启动类 |

#### 认证 & 安全 (`security/`)
| 文件 | 说明 |
|------|------|
| `JwtUtil.kt` | JWT 生成/验证 (access_token + refresh_token) |
| `JwtAuthFilter.kt` | OncePerRequestFilter — 拦截请求，验证 access_token，三级缓存权限检查 |
| `CustomUserDetailsService.kt` | UserDetailsService — 从 DB 加载用户，供 Security 认证 |
| `RefreshTokenService.kt` | refresh_token CRUD (Redisson RBucket 存储) |
| `RolePermissionCache.kt` | 三级缓存实现 — Caffeine L1 + Redis L2 + DB L3 |

#### 业务 API (`controller/`)
| 文件 | 端点 | 说明 |
|------|------|------|
| `AuthController.kt` | `/api/v1/auth/*` | 注册、登录、刷新、退出、修改密码、OTP、WebAuthn、个人资料 |
| `RoleController.kt` | `/api/v1/roles` | 角色 CRUD |
| `AdminController.kt` | `/api/v1/admin/*` | 用户列表、角色分配、权限查询、重置密码 |

#### 数据模型 (`model/`)
| 文件 | 表 | 字段 |
|------|-----|------|
| `User.kt` | `users` | id, username, password, email, nickname, phone, enabled, createdAt |
| `Role.kt` | `roles` | id, name, description |
| `Permission.kt` | `permissions` | id, code, module |

#### 配置 (`config/`)
| 文件 | 说明 |
|------|------|
| `SecurityConfig.kt` | Spring Security 配置 — 权限路径拦截、CORS 配置 |
| `RedissonConfig.kt` | RedissonClient Bean 配置 |
| `CacheConfig.kt` | Caffeine 本地缓存配置 |
| `WebAuthnConfig.kt` | WebAuthn / FIDO2 通行密钥依赖配置 |
| `DataInitializer.kt` | 启动时初始化 admin 用户、角色及基础权限 |

---

### 2. Order Service (`backend/order-service/src/main/kotlin/com/joycai/orderservice/`)
端口: 8081 | 数据库: PostgreSQL (`order_service`:5433)

#### 应用入口
| 文件 | 说明 |
|------|------|
| `OrderServiceApplication.kt` | 订单服务 Spring Boot 启动类 |

#### 业务逻辑 (`controller/`, `service/`, `model/`)
| 模块/文件 | 端点/说明 |
|-----------|-----------|
| `controller/` | 订单、商品目录、购物车、库存管理 REST 端点 |
| `service/` | 订单状态流转、库存扣减机制 |
| `model/` | Order, Item, Cart 等 JPA 实体 |

---

### 3. IAM Client Starter (`backend/iam-client-starter/`)
共享库模块 — 自动注入 IAM JWT 鉴权拦截器，供 `order-service` 引入。

| 文件 | 说明 |
|------|------|
| `IamAutoConfiguration.kt` | Spring Boot 自动装配类 |
| `IamJwtAuthFilter.kt` | 客户端 JWT 请求头解析与校验过滤器 |
| `IamProperties.kt` | IAM 客户端配置参数属性映射 |

---

## Frontend (`frontend/src/`)

### 页面路由组 (`app/`)
| 路由分组 | 说明 | 对应路径 |
|----------|------|----------|
| `/` | 开放展台 | `app/(storefront)/page.tsx` |
| `/items` | 商品目录列表与详情 | `app/(storefront)/items/` |
| `/cart` | 购物车 | `app/(storefront)/cart/` |
| `/account` | 买家个人中心与买家订单 | `app/(buyer)/account/` |
| `/seller` | 卖家管理门户 | `app/(seller)/seller/` |
| `/admin` | IAM 系统管理后台 | `app/admin/` (用户/角色/权限/设置) |
| `/login` | 登录页 (WebAuthn / JWT) | `app/login/page.tsx` |
| `/register` | 注册页 | `app/register/page.tsx` |

---

## 基础设施与工具

- **Docker Compose**: `docker-compose.yml` (PostgreSQL 5432 + 5433, Redis 6379)
- **Windows 启动脚本**: `start-all.bat`
- **PM2 配置文件**: `ecosystem.config.js`
- **Playwright E2E 测试**: `tests/login.spec.ts`
