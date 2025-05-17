

![App Logo](https://res.cloudinary.com/dnjvyciqt/image/upload/v1746881501/yzztqgtdqknfj9vzihou.png)

# 🔑 Keact

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
- 🧩 Support for context-based scoping
- 💡 Developer-friendly API

---

## 🔧 Usage

### 1. Initialize and Use State

```ts
// In any component

import { useKeact } from '@inancakduvan/keact';

// Initialize once
const [username, setUsername] = useKeact('username', {
  initialValue: 'John Doe'
});

// Read elsewhere globally by key
const [username] = useKeact('username');

// Also set elsewhere globally by key
const [username, setUsername] = useKeact('username');
setUsername('George Brown');
```

📌 That's it — no providers, no boilerplate.


### 2. If you need type-safety

Create a `keact.d.ts` file in your source directory (e.g., `types/keact.d.ts`) and declare your keys and their types:

```ts
// types/keact.d.ts
import '@inancakduvan/keact';

declare module '@inancakduvan/keact' {
  interface KeactTypeRegistry {
    username: string;
    count: number;
  }
}
```

---

## 🧩 Contextual State (Scoped to a Provider)

Use `KeactContext` to isolate state between parts of your app:

```tsx
import { KeactContext, useKeact } from "@inancakduvan/keact";

function ProfilePage() {
  return (
    <KeactContext name="profile">
      <Profile />
    </KeactContext>
  );
}

function Profile() {
  const [username, setUsername] = useKeact("username", {
    context: "profile",
    initialValue: 'John Doe',
  });

  return (
    <button onClick={() => setUsername('George Brown')}>Username: {username}</button>
  );
}
```

➡️ Now `username` is isolated to only the `"profile"` scope.

---

## Type-safety for contextual states

```ts
// types/keact.d.ts
import "@inancakduvan/keact";

declare module "@inancakduvan/keact" {
  // global states
  interface KeactTypeRegistry {
    appVersion: string;
  }

  // contextual states
  interface KeactContextTypeRegistry {
    profile: {
      username: string;
    };
  }
}
```

---

## 🧼 Memory efficiency

Keact adds the state into store only when it is needed. It will not consume memory until it is needed to use.

---

## 📺 A demo page:
https://keact.vercel.app/

---

## 📄 License

MIT

---

Made with ❤️ by **İnanç**.