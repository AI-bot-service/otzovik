# Features — otzovik

## ✅ Реализовано
_(пусто — проект только создан)_

## 🔄 В процессе
_(пусто)_

## 📋 MVP — Запланировано

### Аутентификация (Email OTP)
- [ ] POST /auth/send-otp — отправить код на email
- [ ] POST /auth/verify-otp — проверить код, выдать JWT + refresh
- [ ] POST /auth/refresh — обновить access token
- [ ] POST /auth/logout — инвалидировать refresh
- [ ] Middleware проверки JWT
- [ ] Роли admin/user
- [ ] Страница Login (форма email → ввод кода → дашборд)

### Поиск сайтов (ядро продукта)
- [ ] Модель SearchQuery (БД)
- [ ] POST /search/queries — создать запрос, запустить Celery
- [ ] GET /search/queries — список запросов пользователя
- [ ] GET /search/queries/{id} — детали + все карточки сайтов
- [ ] DELETE /search/queries/{id} — soft delete
- [ ] WS /search/queries/{id}/progress — live прогресс
- [ ] Celery task: Step 1 — Discovery через SearXNG
- [ ] Celery task: Step 2 — Site profiling (тип, регистрация, антибот)
- [ ] Celery task: Step 3 — Content scraping (httpx + Playwright fallback)
- [ ] Celery task: Step 4 — AI-анализ (Claude API)
- [ ] Celery task: Step 5 — Persist site_analyses + snippets

### Карточки сайтов
- [ ] Модели Site, SiteAnalysis, ReviewSnippet (БД)
- [ ] GET /analyses/{id} — карточка сайта для запроса
- [ ] GET /analyses/{id}/snippets — примеры отзывов
- [ ] GET /sites — каталог всех сайтов
- [ ] Расчёт relevance_score

### Frontend — Дашборд
- [ ] Layout с sidebar + topbar
- [ ] Страница Overview (последние запросы + статистика)
- [ ] Страница New Search (форма создания ОП)
- [ ] Страница Search Progress (live WebSocket прогресс)
- [ ] Страница Search Results (grid карточек SiteCard)
- [ ] Страница Site Detail (развёрнутая карточка + сниппеты)

### Frontend — Модули
- [ ] SiteCard модуль
- [ ] DataTable модуль
- [ ] SearchProgress модуль
- [ ] SentimentBar модуль
- [ ] Filters модуль
- [ ] ConfirmDialog модуль
- [ ] EmptyState модуль
- [ ] StatusBadge модуль

### Админка
- [ ] GET /admin/users — список пользователей
- [ ] PATCH /admin/users/{id} — роль / блокировка
- [ ] GET /admin/stats — статистика
- [ ] GET /admin/audit-logs — журнал
- [ ] Страница Admin (Users + Stats)

## 🚀 Будущие версии (Full)
- [ ] OAuth (Google/Yandex)
- [ ] Мультитенантность (команды)
- [ ] Stripe биллинг + тарифные планы
- [ ] Экспорт результатов (CSV/PDF)
- [ ] Email уведомления (завершение поиска)
- [ ] Автоматический re-анализ сайтов (weekly)
- [ ] Автоматический постинг отзывов (killer feature v2)
- [ ] API для внешних интеграций
