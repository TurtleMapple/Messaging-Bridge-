# Hono Messaging Bridge

Hono Messaging Bridge is an API service built with [Hono](https://hono.dev/) and [Bun](https://bun.sh/) that acts as a unified platform to send messages across multiple channels, including WhatsApp, Telegram, and Email.

## Features

- **🚀 High Performance**: Powered by Bun and Hono.
- **📱 WhatsApp Integration**: Native WhatsApp connection using [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys).
- **🤖 Telegram Integration**: Bot integration using [`grammy`](https://grammy.dev/).
- **📧 Email Integration**: Sends emails via [Resend](https://resend.com/).
- **🛡️ Type-Safe API & Validation**: Powered by `Zod` and `@hono/zod-openapi`.
- **📖 Auto-generated Documentation**: Interactive API reference via Scalar at `/reference`.
- **🔐 Secure**: API Key authentication protecting all messaging endpoints.

## Project Structure

```text
├── 📁 docs
│   ├── 📝 coding-standard.md
│   ├── 📝 commit-standard.md
│   └── 📝 unit-testing-standard.md
├── 📁 src
│   ├── 📁 common
│   │   ├── 📁 config
│   │   │   └── 📄 env.ts
│   │   ├── 📁 middleware
│   │   │   ├── 📄 auth.ts
│   │   │   └── 📄 error-handler.ts
│   │   └── 📁 utils
│   │       ├── 📄 errors.ts
│   │       └── 📄 response.ts
│   ├── 📁 modules
│   │   ├── 📁 email
│   │   │   ├── 📁 interfaces
│   │   │   │   └── 📄 email-provider.interface.ts
│   │   │   ├── 📁 providers
│   │   │   │   ├── 📄 mock-email.provider.ts
│   │   │   │   └── 📄 resend.provider.ts
│   │   │   ├── 📁 tests
│   │   │   │   ├── 📄 email.controller.test.ts
│   │   │   │   ├── 📄 email.schema.test.ts
│   │   │   │   ├── 📄 email.service.test.ts
│   │   │   │   └── 📄 resend.provider.test.ts
│   │   │   ├── 📄 email.controller.ts
│   │   │   ├── 📄 email.schema.ts
│   │   │   └── 📄 email.service.ts
│   │   ├── 📁 telegram
│   │   │   ├── 📁 tests
│   │   │   │   ├── 📄 telegram.controller.test.ts
│   │   │   │   ├── 📄 telegram.schema.test.ts
│   │   │   │   └── 📄 telegram.service.test.ts
│   │   │   ├── 📄 telegram.controller.ts
│   │   │   ├── 📄 telegram.schema.ts
│   │   │   └── 📄 telegram.service.ts
│   │   └── 📁 whatsapp
│   │       ├── 📁 tests
│   │       │   ├── 📄 whatsapp.connection.test.ts
│   │       │   ├── 📄 whatsapp.controller.test.ts
│   │       │   ├── 📄 whatsapp.schema.test.ts
│   │       │   └── 📄 whatsapp.service.test.ts
│   │       ├── 📄 whatsapp.connection.ts
│   │       ├── 📄 whatsapp.controller.ts
│   │       ├── 📄 whatsapp.schema.ts
│   │       └── 📄 whatsapp.service.ts
│   ├── 📄 index.ts
│   └── 📄 server.ts
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 📄 LICENSE
├── 📝 README.md
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── ⚙️ pnpm-workspace.yaml
└── ⚙️ tsconfig.json
```

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

## Getting Started

### 1. Install Dependencies

```sh
bun install
```

### 2. Environment Variables

Create a `.env` file in the root directory and populate it with the following required variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Auth
API_KEY=your_secure_api_key_here

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_email@example.com
```

### 3. Run the Application

Start the development server:

```sh
bun run dev
```

### 4. WhatsApp Authentication

Upon running the server, if you haven't linked a WhatsApp account yet, a QR code will be generated in the terminal. Scan this QR code with your WhatsApp mobile app to authenticate the session.

## API Documentation

Once the server is running, you can explore the interactive API documentation and test endpoints directly from your browser:

- **API Reference**: [http://localhost:3000/reference](http://localhost:3000/reference)
- **OpenAPI Schema**: [http://localhost:3000/doc](http://localhost:3000/doc)

To use the protected endpoints, remember to provide the `X-API-Key` header with the value of your `API_KEY`.

## Built With

- [Hono](https://hono.dev/)
- [Bun](https://bun.sh/)
- [Baileys](https://github.com/WhiskeySockets/Baileys)
- [Grammy](https://grammy.dev/)
- [Resend](https://resend.com/)
- [Zod](https://zod.dev/)
