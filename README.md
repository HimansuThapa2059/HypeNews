# 🚀 HypeNews

A high-performance **HackerNews clone** built with **Bun**, **Hono**, **Docker**, **TypeScript**, and **TanStack**.

HypeNews replicates the core functionality of HackerNews: posting, commenting, and voting, with a modern, fast, and type-safe stack.

---

## 🛠 Features & Development

### Local Development

**Prerequisites:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Bun Runtime](https://bun.sh/)

To get started, run the following commands in your terminal:

```bash
# 1. Prepare environment variables
make env

# 2. Setup Docker and install dependencies
make setup

# 3. Launch development servers
make start
```

### 📋 Makefile Commands Reference

| Command         | Action                                                     |
| :-------------- | :--------------------------------------------------------- |
| `make env`      | Initializes `.env` from `.env.example`                     |
| `make setup`    | Starts Docker and runs `bun install` for root and frontend |
| `make start`    | Parallel execution of backend and frontend dev servers     |
| `make db-setup` | Runs database migrations and schema push                   |
| `make db-reset` | **Wipes all data** and resets the database containers      |
| `make clean`    | Full cleanup of containers and volumes                     |

---

## ⚠️ Important Configuration

### Email Service (Resend)

This project uses **Resend** by default for email delivery. If you do not have a Resend account/API key:

1. Open the `sendemail.ts` file.
2. Comment out the code block utilizing the Resend SDK.
3. Replace it with your preferred email service provider or a mock function.

### Environment Variables

For the application to function properly, you **must** provide values for all required keys in your `.env` file (e.g., Database credentials, Auth secrets, and API keys). Without these, specific modules may fail to initialize.

---

## 🛠 Project Roadmap (TODO)

- [ ] **Post Categorization**: Add an optional `type` property to posts (e.g., `SHOW`, `ASK`, `JOB`).
- [ ] **Submission UI**: Update the post creation form to allow users to select or skip the post type.
- [ ] **Feed Filtering**: Implement logic to filter posts by `type` for navigation tabs.
- [ ] **Dynamic Rendering**: Automatically prefix titles (e.g., "Show: Project Name").
- [ ] **Robust Error Handling**: Implement a custom `404 Not Found` page for missing `postId` routes.

---

## 🐛 Known Issues

- **Optimistic Update Identity**: When replying to a comment, the UI temporarily displays a "Deleted User" placeholder. The correct user identity is automatically restored once server revalidation completes or the page is refreshed.

---

## 📝 License

This project is licensed under the [MIT License](./LICENSE).
