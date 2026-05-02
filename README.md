# 🌉 Hono Messaging Bridge

Hono Messaging Bridge is a high-performance, unified API service designed to act as a central hub for dispatching messages across multiple channels. Built on top of **[Bun](https://bun.sh/)** and **[Hono](https://hono.dev/)**, this service provides a single, secure REST API to send messages via WhatsApp, Telegram, and Email.

By abstracting the complexities of individual platform SDKs, it allows developers to easily integrate omni-channel messaging capabilities into their applications with zero friction, backed by robust validation, native OpenAPI documentation, and strict TypeScript safety.

---

## 🛠️ Tech Stack

This project is built using modern web technologies to ensure maximum performance and developer experience:

- **Runtime**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.
- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework for the Edges.
- **Validation & Schema**: [Zod](https://zod.dev/) - TypeScript-first schema validation.
- **API Documentation**: 
  - [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - Zod to OpenAPI schema generation.
  - [Scalar](https://scalar.com/) - Beautiful API Reference UI.
- **Providers / SDKs**:
  - **WhatsApp**: [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) (Native WebSocket connection)
  - **Telegram**: [`grammy`](https://grammy.dev/) (Telegram Bot API framework)
  - **Email**: [Resend](https://resend.com/) & `nodemailer` (Modern email delivery)

---

## 🔄 System Flow & Architecture

The system is designed with a modular, SOLID-compliant architecture. Here is the general flow of a message request:

1. **Client Request**: The client sends an HTTP POST request to the desired channel endpoint (e.g., `/whatsapp/send`, `/email/send`) containing the necessary payload and an `X-API-Key` header.
2. **Authentication Middleware**: The global `apiKeyAuth` middleware intercepts the request. It verifies the API key against the server's environment variable. If invalid, it returns a `401 Unauthorized`.
3. **Validation Layer**: The request reaches the specific module's router. `zod-openapi` strictly validates the incoming JSON body against the defined Zod schemas. If validation fails, a structured `400 Bad Request` error is returned automatically.
4. **Controller & Service Layer**: 
   - The **Controller** receives the validated data and delegates the business logic to the corresponding **Service**.
   - The **Service** interacts with the underlying provider SDKs (Baileys for WhatsApp, Grammy for Telegram, Resend for Email).
5. **Execution & Response**: 
   - The provider executes the action (sending the message).
   - The Service returns the result back to the Controller.
   - The Controller sends a standardized `JSend` JSON response (`success`, `fail`, `error`) back to the client.
6. **Error Handling**: Any errors thrown during this process are caught by the global `errorHandler` middleware, which formats them into a consistent HTTP response.

---

## 🚀 Getting Started

Follow these steps to set up and run the Hono Messaging Bridge on your local machine.

### 1. Prerequisites

- **[Bun](https://bun.sh/)** installed on your machine (`curl -fsSL https://bun.sh/install | bash`).
- A WhatsApp account (for WhatsApp integration).
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather)).
- A Resend API Key (from [resend.com](https://resend.com)).

### 2. Installation

Clone the repository and install the dependencies using Bun:

```sh
# Clone the repository
git clone https://github.com/TurtleMapple/Messaging-Bridge.git
cd Messaging-Bridge

# Install dependencies
bun install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and populate it with your credentials:

```env
# Application
NODE_ENV=development
PORT=3000

# Security
API_KEY=your_secure_api_key_here

# Telegram Provider
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Email Provider (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_email@example.com
```

### 4. Running the Application

Start the development server with hot-reloading:

```sh
bun run dev
```

**WhatsApp Authentication Flow:**
Upon the first run, the system will initialize the WhatsApp (Baileys) connection. It will generate a QR code in your terminal. Open your WhatsApp mobile app, go to **Linked Devices**, and scan the QR code to authenticate the session. The session state will be saved locally.

### 5. Explore the API

Once the server is running, you can explore the interactive API documentation to test the endpoints directly from your browser:

- **API Reference (Scalar)**: [http://localhost:3000/reference](http://localhost:3000/reference)
- **OpenAPI Schema (JSON)**: [http://localhost:3000/doc](http://localhost:3000/doc)

*Note: To test the endpoints via the UI, use the "Authorize" button to inject your `API_KEY` into the `X-API-Key` header.*

---

## 📁 Project Structure

The project follows a clean, module-based architecture:

```text
├── 📁 docs/              # Project standards and documentation
├── 📁 src/
│   ├── 📁 common/        # Shared resources (config, middleware, utils, errors)
│   ├── 📁 modules/       # Feature modules
│   │   ├── 📁 email/     # Email provider logic (Resend, Nodemailer)
│   │   ├── 📁 telegram/  # Telegram Bot logic (Grammy)
│   │   └── 📁 whatsapp/  # WhatsApp logic (Baileys, Connection State)
│   ├── 📄 index.ts       # Hono App initialization & Routing
│   └── 📄 server.ts      # Bun Server entry point & Bootstrap
└── ⚙️ .env.example       # Example environment variables
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
