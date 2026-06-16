# SocialSignal Pro Frontend

## Pages

- `/login` - Dedicated login page using the default demo credentials `admin` / `admin123`.
- `/` or `/analyzer` - Analyzer page with the post sidebar and result dashboard.
- `/create-post` - Facebook-style create-post page. The page uses bundled local stock-style assets and saves posts through `POST /api/social/posts`.

## Running locally

```bash
npm install
npm run dev
```

The default backend API base path is `/api`. Configure `VITE_API_BASE_PATH` if required.
