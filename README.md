# Checklist Gia Dinh

Web app checklist hang ngay cho hai vo chong.

## Tinh nang

- Khong login, vao web la dung.
- Hai nguoi mac dinh: Chong va Vo.
- Cong viec rieng hoac ca hai cung lam.
- Cong viec hang ngay hoac mot ngay duy nhat.
- Task chung chi tinh xong toan bo khi ca hai deu tick.
- Moi nguoi co trang thai hoan thanh rieng tren task chung.
- Tu goi API moi khi mo lai tab/app nho SWR `revalidateOnFocus`.
- Thong ke 7 ngay va streak cho task hang ngay.

## Chuan bi database

Tao file `.env.local` tu `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

Khong commit file `.env.local`.

Sau khi dat `DATABASE_URL`, chay:

```bash
npm run prisma:push
npm run prisma:generate
```

## Chay local

```bash
npm install
npm run dev
```

Mo `http://localhost:3000`.

## Deploy Vercel

1. Tao project tren Vercel tu repo nay.
2. Them environment variable `DATABASE_URL`.
3. Chay deploy.
4. Sau khi doi schema, chay `npm run prisma:push` tu local voi `DATABASE_URL` moi.
