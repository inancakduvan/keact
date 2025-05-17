"use client";

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

import { Copy, Info } from 'lucide-react';

const npmInstallCode = `npm i @inancakduvan/keact`;

const basicUsageCode = `// In any component

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
// End`

const basicTypeSafetyCode = `import '@inancakduvan/keact';

declare module '@inancakduvan/keact' {
  interface KeactTypeRegistry {
    username: string;
    count: number;
  }
}
// End`

const contextUsageCode = `import { KeactContext, useKeact } from "@/packages/keact/src";

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
// End`

const contextTypeSafetyCode = `// types/keact.d.ts
import "@/packages/keact/src";

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
// End`

export default function Home() {
  function copyToClipboard(text: string) {
      if (navigator.clipboard && window.isSecureContext) {
        // Modern approach using the Clipboard API
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
        return Promise.resolve();
      }
  }

  return <div className='w-full max-w-[730px] mx-auto my-0'>
    <div className='flex items-center justify-center md:mt-4'>
      <img className='md:rounded shadow-xs' src="https://res.cloudinary.com/dnjvyciqt/image/upload/v1747499928/keact_banner_jsve0i.png" alt='logo' />
    </div>

    <div className='p-4'>
      <div className="text-4xl font-bold mt-4">Keact</div>

      <div className='mt-2'>
        <strong>Keact</strong> is a minimal, key-based global state manager for React. No providers, no boilerplate — just a single hook to share state across your app.
      </div>
      
      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">Install</div>

      <div className='relative'>
        <CodeMirror className='rounded' value={npmInstallCode} theme="dark" extensions={[javascript({ jsx: true })]} readOnly />
        
        <Copy size={14} className='absolute right-2 top-1.5 text-gray-100 cursor-pointer' onClick={() => copyToClipboard(npmInstallCode)} />
      </div>

      <div className='flex items-center gap-4 p-2 text-xs bg-gray-100 border-1 rounded mt-4'>
        <Info className='text-yellow-900' /> Requires React 18 or higher.
      </div>
      
      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">Features</div>

      <div className='flex flex-col gap-2 mt-2'>
        <div>✅ Zero configuration</div>
        <div>🔑 Key-Based Global State Access</div>
        <div>⚡ Fast and memory-efficient</div>
        <div>🧩 Support for context-based scoping</div>
        <div>💡 Developer-friendly API</div>
      </div>
      
      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">Usage</div>

      <div className='text-lg font-bold text-gray-500 mt-1 mb-4'>1. Just define it when/where you need</div>

      <div className='relative'>
        <CodeMirror className='rounded' value={basicUsageCode} theme="dark" extensions={[javascript({ jsx: true })]} readOnly />
        
        <Copy size={14} className='absolute right-2 top-1.5 text-gray-100 cursor-pointer' onClick={() => copyToClipboard(basicUsageCode)} />
      </div>

      {/* eslint-disable-next-line react/no-unescaped-entities */}
      <div className='mt-2'>📌 That's it — no providers, no boilerplate.</div>

      <div className='text-lg font-bold text-gray-500 mt-8 mb-2'>2. If you need type-safety</div>
      
      <div className='mt-2 mb-4'>
        Create a <strong>keact.d.ts</strong> file in your source directory (e.g., <strong>types/keact.d.ts</strong>) and declare your keys and their types:
      </div>

      <div className='relative'>
        <CodeMirror className='rounded' value={basicTypeSafetyCode} theme="dark" extensions={[javascript({ jsx: true })]} readOnly />
        
        <Copy size={14} className='absolute right-2 top-1.5 text-gray-100 cursor-pointer' onClick={() => copyToClipboard(basicTypeSafetyCode)} />
      </div>
      
      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">Contextual State (Scoped to a Provider)</div>
      
      <div className='mb-4'>
        Use <strong>KeactContext</strong> to isolate state between parts of your app.
      </div>

      <div className='relative'>
        <CodeMirror className='rounded' value={contextUsageCode} theme="dark" extensions={[javascript({ jsx: true })]} readOnly />
        
        <Copy size={14} className='absolute right-2 top-1.5 text-gray-100 cursor-pointer' onClick={() => copyToClipboard(contextUsageCode)} />
      </div>
      
      {/* eslint-disable-next-line react/no-unescaped-entities */}
      <div className='mt-2'>➡️ Now <strong>username</strong> is isolated to only the <strong>"profile"</strong> scope.</div>
      
      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">Type-safety for contextual states</div>

      <div className='relative'>
        <CodeMirror className='rounded' value={contextTypeSafetyCode} theme="dark" extensions={[javascript({ jsx: true })]} readOnly />
        
        <Copy size={14} className='absolute right-2 top-1.5 text-gray-100 cursor-pointer' onClick={() => copyToClipboard(contextTypeSafetyCode)} />
      </div>

      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">🧼 Memory efficiency</div>

      <div>
        Keact adds the state into store only when it is needed. It will not consume memory until it is needed to use.
      </div>

      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">📺 A demo page:</div>

      <div className='text-indigo-700 underline'>
        <a href='https://keact.vercel.app/demo' target='_blank' rel="noreferrer noopener">https://keact.vercel.app/demo</a>
      </div>

      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">📄 License</div>

      <div>
        MIT
      </div>

      <div className='seperator'></div>

      <div className="text-2xl font-bold mt-4 mb-2">☕️ Buy me a coffee</div>
      
      <div className='text-indigo-700 underline mb-4'>
        <a href='https://buymeacoffee.com/inancakduvan' target='_blank' rel="noreferrer noopener">https://buymeacoffee.com/inancakduvan</a>
      </div>

      <div className='seperator'></div>

      <div className='mb-8'>
        Made with ❤️ by <a className='text-indigo-700' href='https://github.com/inancakduvan' target='_blank' rel="noreferrer noopener">İnanç.</a>
      </div>
    </div>
  </div>
}
