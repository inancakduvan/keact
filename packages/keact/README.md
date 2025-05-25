

![App Logo](https://res.cloudinary.com/dnjvyciqt/image/upload/v1747499928/keact_banner_jsve0i.png)

# 🔑 Keact

**Keact** is a minimal, key-based global state manager for React. No providers, no boilerplate — just a single hook to share state across your app.

---

## 🚀 Installation

```bash
npm i @inancakduvan/keact
```

> Requires React 18 or higher.

---

## 📝 Official Documentation:
https://keact.vercel.app

---

## ✨ Features

- ✅ Zero configuration
- 🔑 Key-Based Global State Access
- ⚡ Fast and memory-efficient
- 💡 Developer-friendly API

---

## 🔧 Usage

### 1. The simplest way — define anywhere and use everywhere

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

```ts
// store.ts
import { typeSafeKeact } from "@inancakduvan/keact";

interface KeactStore {
  basket: {
    id: string;
    count: number;
  }
}

export const useKeact = typeSafeKeact<KeactStore>();

// your-component.ts
import { useKeact } from "@/store.ts";

const [basket, setBasket] = useKeact('basket');

setBasket({
  id: "12345",
  count: 3
});
```

<!-- --- -->

<!-- ## 🧩 Contextual State (Scoped to a Provider)

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

➡️ Now `username` is isolated to only the `"profile"` scope. -->

<!-- ---

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
``` -->

<!-- --- -->

## 🧼 Memory efficiency

Keact adds the state into store only when it is needed. It will not consume memory until it is needed to use.

---

## 📺 A demo page:
https://keact.vercel.app/demo

---

## 📄 License

MIT

---

Made with ❤️ by **İnanç**.