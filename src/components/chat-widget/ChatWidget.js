'use client';

import { useEffect, useRef, useState } from 'react';
import useAddToCart from '@hooks/useAddToCart';
import ChatServices from '@services/ChatServices';
import { CHAT_MESSAGE_STYLES, CHAT_CONTAINER_STYLE, CHAT_HEADER_STYLE, DEEP_CHAT_STYLE } from './chatStyles';

function handleChatResponse({ response, chat, lastCategoryRef, lastProductsRef }) {
  if (!response?.data) return response;

  const reply = response.data.reply || '';
  const ctx = response.data.context || {};
  const products = response.data.products || [];
  const hasProducts = products.length > 0;
  let options = ctx.options || [];

  if (ctx.category && ctx.ambiguous === false) {
    lastCategoryRef.current = ctx.category;
  }

  if (ctx.ambiguous === true && lastCategoryRef.current) {
    options = [{ label: lastCategoryRef.current }, ...options];
  }

  if (hasProducts) {
    lastProductsRef.current = products;
    options = [...options, { label: 'Agregar al carrito' }, { label: 'Inicio' }];
  }

  if (ctx.intent === 'add_to_cart') {
    const productOptions = (lastProductsRef.current || []).map((p) => ({
      label: p.name,
      value: p.id,
    }));

    if (productOptions.length > 0) {
      setTimeout(() => injectButtons(chat, productOptions), 0);
    }

    return {
      type: 'text',
      text: reply,
    };
  }

  if (options.length > 0) {
    setTimeout(() => injectButtons(chat, options), 0);
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

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const chatRef = useRef(null);
  const lastCategoryRef = useRef(null);
  const lastProductsRef = useRef([]);
  const initializedRef = useRef(false);
  const { handleAddItem } = useAddToCart();

  useEffect(() => {
    import('deep-chat');
  }, []);

  useEffect(() => {
    if (!open) return;
    const chat = chatRef.current;
    if (!chat) return;

    if (initializedRef.current) return;
    initializedRef.current = true;

    chat.connect = {
      url: 'http://localhost:5055/api/chat',
      method: 'POST',
    };

    const SESSION_ID = 'session_deepchat_01';

    chat.requestInterceptor = (requestDetails) => {
      const lastText = requestDetails?.body?.messages?.at(-1)?.text || requestDetails?.body?.text || '';

      const selectedProduct = lastProductsRef.current.find((p) => p.name === lastText);

      if (selectedProduct) {
        const newItem = {
          id: selectedProduct.id,
          title: selectedProduct.name,
          price: selectedProduct.price,
          image: selectedProduct.image || '',
          stock: selectedProduct.stock,
        };

        handleAddItem(newItem);

        requestDetails.body = {
          session_id: SESSION_ID,
          message: 'cart_product_key',
        };

        return requestDetails;
      }

      requestDetails.body = {
        session_id: SESSION_ID,
        message: String(lastText),
      };

      return requestDetails;
    };

    chat.messageStyles = CHAT_MESSAGE_STYLES;

    chat.textInput = { placeholder: { text: 'Escribe tu busqueda' } };

    chat.responseInterceptor = (response) => {
      return handleChatResponse({
        response,
        chat,
        lastCategoryRef,
        lastProductsRef,
      });
    };

    (async () => {
      try {
        const response = await ChatServices.sendMessage({
          session_id: SESSION_ID,
          message: '__init__',
        });

        const parsed = handleChatResponse({
          response,
          chat,
          lastCategoryRef,
          lastProductsRef,
        });

        if (parsed?.text) {
          chat.addMessage({
            role: 'ai',
            text: parsed.text,
          });
        }
      } catch (error) {
        console.error('Init chat error:', error);
      }
    })();
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

      <div
        style={{
          ...CHAT_CONTAINER_STYLE,
          display: open ? 'block' : 'none',
        }}
      >
        <div style={CHAT_HEADER_STYLE}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>KaChat </span>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <deep-chat ref={chatRef} style={DEEP_CHAT_STYLE} />
      </div>
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
          detail: { text: '${escapeHtml(opt.label)}', value: '${opt.value || ''}' }
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
