'use client';

import { useEffect, useRef, useState } from 'react';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const chatRef = useRef(null);

  // loading deepchat web component in client
  useEffect(() => {
    import('deep-chat');
  }, []);

  useEffect(() => {
    if (!open) return;

    const chat = chatRef.current;
    if (!chat) return;

    chat.connect = {
      url: 'http://localhost:5055/api/chat',
      method: 'POST',
    };

    chat.messageStyles = {
      html: {
        shared: {
          bubble: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: '0px',
          },
        },
      },
    };

    chat.responseInterceptor = (response) => {
      const options = response?.options || [];

      if (options.length) {
        setTimeout(() => {
          injectButtons(chat, options);
        }, 0);
      }

      return response;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className={[
          'fixed bottom-4 right-6 z-50',
          'h-14 w-14 rounded-full',
          'shadow-lg',
          'flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
          open ? 'bg-gray-800 text-white' : 'bg-green-600 text-white',
          'focus:outline-none focus:ring-4 focus:ring-green-200',
        ].join(' ')}
      >
        {!open && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-20 animate-ping" />
        )}

        <span className="relative text-xl leading-none">{open ? '✕' : '💬'}</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-1 z-50 bg-white shadow-xl rounded-lg">
          <deep-chat ref={chatRef} style={{ width: '360px', height: '520px', display: 'block' }} />
        </div>
      )}
    </>
  );
};

function injectButtons(chat, options) {
  const html = `
    <div style="
      display:flex;
      flex-wrap:wrap;
      gap:6px;
      margin-top:4px;
    ">
      ${options
        .map(
          (opt) => `
          <button
            class="deep-chat-suggestion-button"
            style="
              background:transparent;
              border:1px solid #225eb8ff;
              color:#374151;
              padding:4px 10px;
              border-radius:6px;
              font-size:13px;
              cursor:pointer;
              line-height:1.4;
            "
            onmouseover="this.style.background='#acacacff'"
            onmouseout="this.style.background='transparent'"
            onclick="this.parentElement.style.display='none'"
          >
            ${escapeHtml(opt)}
          </button>
        `
        )
        .join('')}
    </div>
  `;

  chat.addMessage({
    role: 'ai',
    html,
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default ChatWidget;
