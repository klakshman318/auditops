# AuditOps

AuditOps is a repository security and compliance scanning platform that helps engineering teams identify VAPT risks, secrets, insecure code patterns, and audit-readiness gaps before production release.

It allows users to upload a repository ZIP file, start an automated scan, and view scan results with severity, affected files, rule details, AI explanation, impact, standards mapping, and remediation guidance.

## Key Features

- Repository ZIP upload
- Automated scan initiation
- Scan status tracking
- Security findings dashboard
- Severity-based summary
- Search and filter findings
- Detailed finding drawer
- AI-generated explanation, impact, and fix steps
- Audit and compliance-focused reporting UI
- Professional SaaS-style frontend using Next.js and Tailwind CSS

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js / NestJS or compatible API service
- REST APIs
- File upload support
- Scan processing service

## Project Structure

```txt
auditops/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── product/
│   │   │   ├── pricing/
│   │   │   └── scan/
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── hooks/
│   │   ├── types/
│   │   └── package.json
│   │
│   └── api/
│       └── backend source files
│
├── README.md
├── .gitignore
└── package.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/klakshman318/auditops.git
cd auditops
```

### 2. Install dependencies

If the project uses npm:

```bash
npm install
```

If the frontend and backend have separate dependencies:

```bash
cd apps/web
npm install

cd ../api
npm install
```

### 3. Configure environment variables

Create `.env.local` inside the frontend app.

```bash
cd apps/web
touch .env.local
```

Add the backend API base URL:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Update the port based on your backend configuration.

### 4. Start the backend

From the backend folder:

```bash
cd apps/api
npm run start:dev
```

Or use the relevant backend start command for your setup.

### 5. Start the frontend

From the frontend folder:

```bash
cd apps/web
npm run dev
```

Open the app in your browser:

```txt
http://localhost:3000
```

## Upload and Scan Flow

1. Open the AuditOps home page.
2. Upload a repository ZIP file.
3. Click **Upload and Scan**.
4. The frontend uploads the ZIP file to the backend API.
5. The backend returns a `scanId`.
6. The frontend redirects to:

```txt
/scan/{scanId}
```

7. The scan result page displays the scan status and findings.

## Expected Backend Upload API

The frontend expects the upload endpoint:

```txt
POST /scans
```

The uploaded file field name is:

```txt
zip
```

Expected response format:

```json
{
  "scanId": "SCAN_ID_HERE"
}
```

The frontend also supports alternative response formats such as:

```json
{
  "id": "SCAN_ID_HERE"
}
```

or:

```json
{
  "data": {
    "scanId": "SCAN_ID_HERE"
  }
}
```

## Scan Result API

The scan result page expects the scan hook to fetch scan details using the scan ID.

Example route:

```txt
GET /scans/{scanId}
```

Example response:

```json
{
  "status": "DONE",
  "summary": {
    "total": 10,
    "critical": 1,
    "high": 2,
    "medium": 5,
    "low": 2
  },
  "findings": []
}
```

## Development Notes

- Do not commit `.env`, `.env.local`, or secret files.
- Do not commit `node_modules`, `.next`, `dist`, or build outputs.
- Keep frontend and backend API response contracts aligned.
- Make sure the backend returns a valid scan ID after upload.
- If scan upload succeeds but the page does not redirect, check the browser console for the scan API response.

## Git Commands

Initial push:

```bash
git add .
git commit -m "Initial commit for AuditOps"
git push
```

Check status:

```bash
git status
```

Check remote:

```bash
git remote -v
```

## Roadmap

- GitHub repository integration
- Scan history
- Report export
- PDF audit report generation
- Organization and team access
- Custom compliance policies
- CI/CD scan integration
- Dashboard analytics

## License

This project is currently private and proprietary. Update this section once the licensing model is finalized.
