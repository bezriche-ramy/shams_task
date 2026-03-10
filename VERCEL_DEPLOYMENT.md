# Vercel Deployment

## What this project expects

- Vite frontend built to `dist`
- API routes exposed through `api/[...route].ts`
- Google Sheets used as the database
- Signed stateless auth tokens via `AUTH_TOKEN_SECRET`

## Environment variables to add in Vercel

- `CLIENT_ORIGIN`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY_BASE64`
- `AUTH_TOKEN_SECRET`

## Recommended values

- `CLIENT_ORIGIN`
  - your Vercel production URL, for example `https://your-project.vercel.app`
- `GOOGLE_SHEET_ID`
  - the spreadsheet id from the sheet URL
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - the service account `client_email`
- `GOOGLE_PRIVATE_KEY_BASE64`
  - base64 encoded version of the service account private key
- `AUTH_TOKEN_SECRET`
  - a long random secret used to sign auth tokens

## PowerShell helpers

### Convert the private key to base64

```powershell
$privateKey = @'
-----BEGIN PRIVATE KEY-----
PASTE_YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
'@
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($privateKey))
```

### Generate a secure auth secret

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Vercel steps

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Framework preset: `Vite`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add the environment variables above in the Vercel dashboard.
7. Redeploy after adding env vars.

## Important

- The service account email must be shared on the Google Sheet as `Editor`.
- Rotate any service account key that has ever been pasted into chat or committed anywhere.
