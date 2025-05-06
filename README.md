# 🧠 Keact

**Keact** is a minimalist, type-safe global state management library for React, inspired by Nuxt's `useState`. It allows you to share reactive state across components with zero boilerplate and full TypeScript support.

---

## 🚀 Installation

```bash
npm i keact
```

> Requires React 18 or higher.

---

## ✨ Features

- ✅ Zero configuration
- 🔑 Key-Based State Access
- ⚡ Fast and memory-efficient
- ♻️ Auto cleanup of unused states
- 💡 Developer-friendly API

---

## 🔧 Usage

### 1. Define Your Global State Types

Create a `keact.d.ts` file in your source directory (e.g., `types/keact.d.ts`) and declare your keys and their types:

```ts
// types/keact.d.ts
import { KeactTypeRegistry } from 'keact';

declare module 'keact' {
  interface KeactTypeRegistry {
    username: string;
    count: number;
  }
}
```

### 2. Initialize and Use State

```ts
// In any component

import { useKeact } from 'keact';

// Initialize once
const [username, setUsername] = useKeact('username', () => 'John Doe');

// Read elsewhere (no need to re-specify type)
const [username] = useKeact('username');
```

---

## 🧼 Automatic Cleanup

Keact automatically removes state from memory if no component is using it anymore. This ensures memory efficiency even in large apps.

---

## 📄 License

MIT

---

Made with ❤️ by İnanç.