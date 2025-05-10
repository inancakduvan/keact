

# <img src="https://res.cloudinary.com/dnjvyciqt/image/upload/v1746882540/taelwwhffuou9qlblvy1.png" alt="Preview" style="width: 20px; transform: translateY(6px); margin-right: 8px;" /> Keact

**Keact** is a minimal, key-based global state manager for React. No providers, no boilerplate — just a single hook to share state across your app.

---

## 🚀 Installation

```bash
npm i @inancakduvan/keact
```

> Requires React 18 or higher.

---

## ✨ Features

- ✅ Zero configuration
- 🔑 Key-Based Global State Access
- ⚡ Fast and memory-efficient
- 💡 Developer-friendly API

---

## 🔧 Usage

### 1. Initialize and Use State

```ts
// In any component

import { useKeact } from '@inancakduvan/keact';

// Initialize once
const [username, setUsername] = useKeact('username', () => 'John Doe');

// Read elsewhere globally by key
const [username] = useKeact('username');

// Also set elsewhere globally by key
const [username, setUsername] = useKeact('username');
setUsername('George Brown');
```

### 2. If you need type-safety

Create a `keact.d.ts` file in your source directory (e.g., `types/keact.d.ts`) and declare your keys and their types:

```ts
// types/keact.d.ts
import { KeactTypeRegistry } from '@inancakduvan/keact';

declare module '@inancakduvan/keact' {
  interface KeactTypeRegistry {
    username: string;
    count: number;
  }
}
```

---

## 🧼 Automatic Cleanup

Keact automatically removes state from memory if no component is using it anymore. This ensures memory efficiency even in large apps.

---

## 📄 License

MIT

---

Made with ❤️ by **İnanç**.