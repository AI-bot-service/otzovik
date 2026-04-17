# otzovik

SaaS для поиска и анализа сайтов с отзывами по объекту поиска (ОП).

## Стек
- Backend: FastAPI (Python 3.12) + SQLAlchemy 2.0 + Alembic + Pydantic v2
- БД: PostgreSQL 15
- Кэш/очереди: Redis 7
- Фоновые задачи: Celery + Celery Beat
- Поиск: SearXNG (self-hosted, бесплатный мета-поисковик)
- AI-анализ: Claude API (claude-sonnet-4-5)
- Скрапинг: httpx + BeautifulSoup4 + Playwright
- Email OTP: aiosmtplib (SMTP)
- Frontend: Next.js 14 (App Router, TypeScript strict)
- UI: Tailwind CSS + shadcn/ui + Framer Motion
- State: Zustand + TanStack Query
- Reverse proxy: Traefik (на хосте, не в compose)

## Design
- Figma: [ВСТАВИТЬ ССЫЛКУ]
- Стиль: editorial dark, монохром + electric lime accent
- Background: #0A0A0B / #141416 / #1C1C1F
- Accent color: #D1FF3C (electric lime)
- Border: #26262A
- Text: #FAFAFA / #8A8A94 / #52525B
- Fonts: Bricolage Grotesque (display), Inter (UI), JetBrains Mono (mono)
- Border radius: 12px (cards), 6px (buttons/inputs)
- Theme: dark-first

## Auth
- Email OTP (6-значный код, Redis TTL 10 мин)
- Admin: refresh 30 дней
- User: refresh 24 часа

## Домен
- Поддомен: otzovik.systemtool.ru
- Traefik network: traefik_network (external, создана на хосте)

## Запуск
```bash
cp .env.example .env
# заполнить .env
cd infra && docker compose up -d
```

## Пересборка frontend
```bash
cd infra && docker compose build frontend && docker compose up -d frontend
```

## Пересборка backend
```bash
cd infra && docker compose build backend && docker compose up -d backend celery-worker celery-beat
```

## Миграции
```bash
cd infra && docker compose exec backend alembic upgrade head
```

## Логи
```bash
cd infra && docker compose logs -f backend
cd infra && docker compose logs -f celery-worker
cd infra && docker compose logs -f searxng
```

## Модули (frontend/components/modules/)
- SiteCard — карточка сайта с рейтингом, sentiment bar, бейджами
- DataTable — универсальная таблица с сортировкой, фильтрами, пагинацией
- SearchProgress — live прогресс Celery через WebSocket
- SentimentBar — визуализация positive/negative/neutral
- Filters — поиск + sort + теги-фильтры
- ConfirmDialog — подтверждение деструктивных действий
- EmptyState — заглушка с CTA
- StatusBadge — статусы pending/running/completed/failed
