# Бебешки дневник (Baby Tracker)

Лично уеб приложение за iPhone за проследяване на **хранене, сън, пелени/гърне и здраве** на бебе и малко дете. Интерфейс на български, защитен вход, данни в база PostgreSQL (Supabase), готови за анализ и експорт.

## Какво може

- **Деца:** няколко профила (напр. новородено + прохождащо), с възраст, изчислявана автоматично
- **Хранене:** кърмене (лява/дясна/двете, таймер), шише (мл, кърма/адаптирано), храна, изцеждане
- **Сън:** дрямка / нощен сън — таймер с един бутон или ръчно въвеждане
- **Пелени и гърне:** мокра, акане (+ цвят), смесена, суха, гърне, инциденти
- **Здраве:** тегло, ръст, обиколка на главата, температура, лекарства (доза), ваксини, симптоми, прегледи
- **Начален екран:** работещи таймери, „преди колко време“ е последното хранене / пелена, „будно от…“, дневно обобщение и хронология
- **Редакция / изтриване** на всеки запис; навигация по дни
- **Експорт в CSV** (всички записи или дневно обобщение) → Files, AirDrop, имейл, Excel
- **Тъмен режим**, инсталиране на началния екран на iPhone като приложение

## Архитектура

| Част | Технология |
|---|---|
| Приложение | Статичен PWA (HTML/CSS/JavaScript, без build стъпка) — `web/` |
| База данни | Supabase PostgreSQL (EU регион) — `supabase/schema.sql` |
| Вход | Supabase Auth (имейл + парола), регистрацията е изключена |
| Хостинг | Netlify или Cloudflare Pages (безплатно, HTTPS) |

## Настройка (≈ 20 минути, еднократно)

### 1. Създайте Supabase проект
- Регистрирайте се на [supabase.com](https://supabase.com) (включете 2FA на акаунта си)
- **New project** → регион **Central EU (Frankfurt)** → силна парола за базата (запазете я в мениджър на пароли)

### 2. Създайте таблиците
- **SQL Editor** → **New query** → поставете съдържанието на `supabase/schema.sql` → **Run**
- Резултат: таблици `children`, `events`, изгледи `v_events`, `v_daily_summary`, всички защитени с Row Level Security

### 3. Създайте акаунта на съпругата си и заключете регистрацията
- **Authentication → Users → Add user → Create new user**: нейният имейл + силна парола, отметнете **Auto Confirm User**
- **Authentication → Sign In / Providers** (или *Settings*): изключете **Allow new users to sign up**
- По желание (допълнителна защита): в края на `schema.sql` има закоментиран блок, който позволява регистрация само на един имейл — сменете имейла, разкоментирайте и изпълнете

### 4. Свържете приложението с базата
- **Project Settings → API**: копирайте **Project URL** и **anon / publishable key**
- Копирайте `web/config.example.js` като `web/config.js` и попълнете двете стойности
- ⚠️ Никога не слагайте `service_role` / secret ключа тук. `config.js` е в `.gitignore` и не се качва в GitHub

### 5. Публикувайте приложението
- **Най-лесно — Netlify Drop:** отворете [app.netlify.com/drop](https://app.netlify.com/drop) и провлачете цялата папка `web/` (вече с `config.js`)
- Сменете името на сайта на нещо трудно за отгатване (Site settings → Change site name)
- Файлът `web/_headers` автоматично добавя защитни HTTP заглавия (CSP, HSTS, забрана за вграждане)
- Алтернатива: Cloudflare Pages → *Upload assets* със същата папка

### 6. Инсталирайте на iPhone
- Отворете адреса в **Safari** → бутон **Сподели** → **Добави към началния екран**
- Отворете от иконата „Дневник“ → влезте с имейла и паролата от стъпка 3
- Добавете децата → готово

## Сигурност — какво е направено

- **Row Level Security** на всички таблици: всеки ред принадлежи на влезлия потребител; анонимен достъп е отнет напълно (тествано: втори потребител вижда 0 реда и не може да променя/трие)
- **Собственикът не може да се подмени:** тригер записва `user_id` от сесията, независимо какво изпраща клиентът
- **Без публична регистрация** — акаунт създава само администраторът
- **Content Security Policy:** зарежда се само собствен код; библиотеката Supabase е вградена локално (`web/vendor/`), без външни CDN
- **Без XSS:** целият потребителски текст се показва като текст, никога като HTML
- **Без кеширане на лични данни:** service worker-ът кешира само файловете на приложението, не и данните
- **CSV експортът** е защитен срещу „formula injection“ в Excel
- **Данни в ЕС** (Франкфурт) — в съответствие с GDPR
- Няма ключове или лични данни в Git репото

**Препоръки:**
- Заключване на iPhone с Face ID / код
- 2FA на акаунтите в Supabase и Netlify
- Безплатният план на Supabase няма автоматични резервни копия за възстановяване — правете CSV експорт веднъж месечно (или минете на Pro за ежедневни бекъпи)
- Безплатният проект се „приспива“ след 7 дни без активност — при ежедневна употреба не е проблем

## Данни за анализ („ingestion“)

Всички времена се пазят в UTC; изгледите ги показват в местно време (Europe/Sofia).

| Обект | Съдържание |
|---|---|
| `events` | Суров запис: `category`, `type`, `started_at`, `ended_at`, `amount`, `unit`, `side`, `milk_type`, `diaper_color`, `label`, `note` |
| `children` | `name`, `birth_date`, `sex`, `color` |
| `v_events` | Събития + име на детето, местно време, `duration_min`, `age_days` |
| `v_daily_summary` | По дете и ден: хранения, мин. кърмене, мл шише, изцедени мл, часове сън, дрямки, пелени, гърне, макс. температура |

**Кодове** (стабилни, на английски — удобни за SQL/Excel/AI):
- `feeding`: `breast`, `bottle`, `solids`, `pumping`
- `sleep`: `nap`, `night`
- `diaper`: `wet`, `dirty`, `mixed`, `dry`, `potty_pee`, `potty_poo`, `accident`
- `health`: `weight` (kg), `height` (cm), `head` (cm), `temperature` (C), `medicine`, `vaccine`, `symptom`, `doctor`

**Начини за достъп:**
- **CSV от приложението:** Настройки → Експорт (UTF-8 с BOM — Excel показва кирилицата правилно)
- **Директна връзка към PostgreSQL** (Excel/Power BI/Python): Supabase → **Connect** → connection string. Пример:

```sql
select day_local, child_name, sleep_hours, bottle_ml, feedings
from v_daily_summary
order by day_local desc;
```

## Обновяване на приложението

- След промяна във файловете сменете `CACHE` във `web/sw.js` (напр. `baby-tracker-v2`) и качете отново папката `web/`
- Промени в базата: добавете нов SQL файл в `supabase/` и го изпълнете в SQL Editor

## Локален тест

```bash
cd apps/baby-tracker/web && python3 -m http.server 8000
```

Отворете http://localhost:8000 (изисква `config.js` с реален Supabase проект).

## Файлове

- `supabase/schema.sql` — таблици, ограничения, RLS политики, изгледи
- `web/index.html`, `web/app.js`, `web/styles.css` — приложението
- `web/sw.js`, `web/manifest.webmanifest`, `web/icons/` — PWA/iPhone инсталация
- `web/_headers` — защитни HTTP заглавия за хостинга
- `web/config.example.js` — шаблон за настройки (копирайте като `config.js`)
- `web/vendor/supabase-2.99.3.js` — официалната библиотека supabase-js (MIT лиценз), вградена локално

## Източници

- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API ключове (anon ключът е предназначен за браузъра при включен RLS): https://supabase.com/docs/guides/api/api-keys
- Supabase Auth — изключване на регистрации: https://supabase.com/docs/guides/auth/general-configuration
- Apple — уеб приложения на началния екран: https://developer.apple.com/documentation/webkit/configuring-web-applications
