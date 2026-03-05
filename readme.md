# Сервис тарифов WB и выгрузки в Google Таблицы

Сервис раз в час забирает тарифы коробов с API Wildberries и сохраняет их в PostgreSQL (с обновлением по дню и складу). Отдельно раз в 30 минут синхронизирует эти данные в несколько Google Таблиц на лист `stocks_coefs`, отсортированный по коэффициенту по возрастанию.

## Что нужно для запуска

- Docker и Docker Compose
- Токен WB API (выдаётся после принятия тестового на HH)
- Google Cloud: сервисный аккаунт с включённым Google Sheets API и JSON-ключ (или email + private key в `.env`)

## Установка и запуск

1. Клонируй репозиторий и перейди в каталог проекта.

2. Создай `.env` из шаблона и заполни секреты:
   ```bash
   cp example.env .env
   ```
   В `.env` обязательно указать:
   - `WB_API_TOKEN` — токен WB API
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — email сервисного аккаунта
   - `GOOGLE_PRIVATE_KEY` — приватный ключ (можно в одну строку с `\n` вместо переносов)

3. Запуск одним командой:
   ```bash
   docker compose up
   ```
   Поднимутся PostgreSQL и приложение. Приложение при старте выполнит миграции и сразу один раз запросит тарифы WB и обновит таблицы.

## Как добавить Google Таблицы

- Создай таблицу в Google, создай лист с именем **`stocks_coefs`**.
- Дай доступ на редактирование таблицы почте сервисного аккаунта (`GOOGLE_SERVICE_ACCOUNT_EMAIL`).
- ID таблицы возьми из URL: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`.
- Добавь этот ID в БД: либо выполни сиды после первого запуска (`npm run knex:dev seed run` локально с подключением к той же БД), либо вставь строку в таблицу `spreadsheets`:
  ```sql
  INSERT INTO spreadsheets (spreadsheet_id, title) VALUES ('твой_spreadsheet_id', 'Название');
  ```
  В сидах уже есть 2–3 заготовки с placeholder ID — их можно заменить на свои.

## Как проверить, что всё работает

1. **Логи приложения**  
   В логах контейнера `app` должны появляться сообщения вида:
   - `DB connected`
   - `Migrations up to date`
   - `WB: done, upserted N rows for YYYY-MM-DD`
   - `Sheets: done, ok=... err=...`

2. **PostgreSQL**  
   Подключись к БД (например, с хоста: `psql -h localhost -U postgres -d postgres`, пароль из `.env`) и проверь данные:
   ```sql
   SELECT * FROM wb_tariffs ORDER BY dt DESC, warehouse_name LIMIT 20;
   ```

3. **Google Таблицы**  
   Открой таблицу, для которой добавлен ID в `spreadsheets`. На листе `stocks_coefs` должны быть заголовки и строки тарифов, отсортированные по коэффициенту (по возрастанию).

## Локальная разработка (без Docker)

- Запусти только Postgres: `docker compose up -d postgres`
- Скопируй `.env`, в нём укажи `POSTGRES_HOST=localhost` (и порт при необходимости).
- Миграции: `npm run knex:dev migrate latest`
- Сиды (опционально): `npm run knex:dev seed run`
- Запуск приложения: `npm run dev`

## Структура

- **Сервисы:** `src/services/wb.ts` (запрос WB API и upsert в `wb_tariffs`), `src/services/sheets.ts` (запись в Google Таблицы).
- **Планировщик:** `src/scheduler.ts` — node-cron: WB каждый час, выгрузка в таблицы каждые 30 минут; при старте оба задания выполняются один раз сразу.
