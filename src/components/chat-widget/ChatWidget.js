'use client';

import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '@services/ChatServices';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const chatRef = useRef(null);
  const lastCategoryRef = useRef(null);

  useEffect(() => {
    import('deep-chat');
  }, []);

  // testing request
  // useEffect(() => {
  //   async function simulateChatProtocol() {
  //     try {
  //       console.log('-- Chat protocol test --');

  //       let response;

  //       response = await sendChatMessage({
  //         sessionId: 'session_frontend_01',
  //         message: 'hola',
  //       });
  //       console.log('1. hola →', response);

  //       response = await sendChatMessage({
  //         sessionId: 'session_frontend_01',
  //         message: 'alimentos',
  //       });
  //       console.log('2. alimentos →', response);

  //       response = await sendChatMessage({
  //         sessionId: 'session_frontend_01',
  //         message: 'frutas',
  //       });
  //       console.log('3. frutas →', response);

  //       console.log('-- End protocol test --');
  //     } catch (error) {
  //       console.error('Error of chat test:', error);
  //     }
  //   }

  //   simulateChatProtocol();
  // }, []);

  useEffect(() => {
    if (!open) return;

    const chat = chatRef.current;
    if (!chat) return;

    chat.connect = {
      url: 'http://localhost:5055/api/chat',
      method: 'POST',
    };

    const SESSION_ID = 'session_deepchat_01';

    chat.requestInterceptor = (requestDetails) => {
      const lastText = requestDetails?.body?.messages?.at(-1)?.text || requestDetails?.body?.text || '';

      requestDetails.body = {
        session_id: SESSION_ID,
        message: String(lastText),
      };

      return requestDetails;
    };

    chat.messageStyles = {
      default: {
        shared: {
          bubble: {
            borderRadius: '12px',
            padding: '10px 12px',
            fontSize: '14px',
            lineHeight: '1.35',
          },
        },
        ai: {
          bubble: {
            backgroundColor: '#10B981',
            color: '#ffffffff',
          },
        },
        user: {
          bubble: {
            backgroundColor: '#e5e7eb',
            color: '#111827',
          },
        },
      },
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
      if (response?.data) {
        const reply = response.data.reply || '';
        const ctx = response.data.context || {};
        let options = ctx.options || [];

        if (ctx.category && ctx.ambiguous === false) {
          lastCategoryRef.current = ctx.category;
        }

        if (ctx.ambiguous === true && lastCategoryRef.current) {
          options = [
            {
              label: lastCategoryRef.current,
              sendText: lastCategoryRef.current,
            },
            ...options,
          ];
        }

        if (options.length > 0) {
          setTimeout(() => {
            injectButtons(chat, options);
          }, 0);

          return {
            type: 'options',
            text: reply,
            options,
          };
        }

        return {
          type: 'text',
          text: reply,
        };
      }

      const legacyOptions = response?.options || [];
      if (legacyOptions.length) {
        setTimeout(() => {
          injectButtons(chat, legacyOptions);
        }, 0);
      }

      return response;
    };
  }, [open]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className={[
            'fixed bottom-4 right-6 z-50',
            'h-14 w-14 rounded-full',
            'shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200 ease-out',
            'hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
            'bg-green-600 text-white',
            'focus:outline-none focus:ring-4 focus:ring-green-200',
          ].join(' ')}
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-20 animate-ping" />
          <span className="relative text-xl leading-none">💬</span>
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '5px',
            zIndex: 9999,
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>KaChat </span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <deep-chat
            ref={chatRef}
            style={{
              width: '360px',
              height: '480px',
              display: 'block',
            }}
          />
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
      border:1px solid #10B981;
      color:#374151;
      padding:4px 10px;
      border-radius:6px;
      font-size:13px;
      cursor:pointer;
      line-height:1.4;
    "
    onclick="
      this.parentElement.style.display='none';
      this.closest('deep-chat')
        ?.dispatchEvent(new CustomEvent('deep-chat-suggestion', {
          detail: { text: '${escapeHtml(opt.sendText || opt.label)}', value: '${opt.value || ''}' }
        }));
    "
  >
    ${escapeHtml(opt.label)}
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
