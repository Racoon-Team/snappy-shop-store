export const CHAT_MESSAGE_STYLES = {
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
        color: '#ffffff',
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

export const CHAT_CONTAINER_STYLE = {
  position: 'fixed',
  bottom: '24px',
  right: '5px',
  zIndex: 9999,
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
};

export const CHAT_HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};

export const DEEP_CHAT_STYLE = {
  width: '360px',
  height: '480px',
  display: 'block',
};
