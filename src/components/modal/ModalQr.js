import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const STATE = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
};

const STATE_INFO = {
  [STATE.PENDING]: {
    color: 'text-yellow-500',
    messageKey: 'checkoutScreen.message.pending',
  },
  [STATE.SUCCESS]: {
    color: 'text-green-500',
    messageKey: 'checkoutScreen.message.success',
  },
  [STATE.ERROR]: {
    color: 'text-red-500',
    messageKey: 'checkoutScreen.message.error',
  },
  default: {
    color: 'text-gray-700',
    messageKey: 'checkoutScreen.message.default',
  },
};

const ModalQrPayment = ({ open, onClose, onSuccess, total, currency, qrCode, loading }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('');
  const [buttonText, setButtonText] = useState(t('checkoutScreen.modalQr.verifyButton'));

  useEffect(() => {
    if (open) {
      setStatus('');
      setButtonText(t('checkoutScreen.modalQr.verifyButton'));
    }
  }, [open, t]);

  const handleVerify = () => {
    if (!qrCode) return;

    setStatus(STATE.PENDING);

    setTimeout(() => {
      setStatus(STATE.SUCCESS);
      setButtonText(t('checkoutScreen.modalQr.okButton'));
    }, 5000);
  };

  const handleButtonClick = () => {
    if (status === STATE.SUCCESS) {
      onSuccess?.();
      onClose();
    } else {
      handleVerify();
    }
  };

  if (!open) return null;

  const { color, messageKey } = STATE_INFO[status] || STATE_INFO.default;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">{t('checkoutScreen.modalQr.title')}</h2>

        <div className="mb-4 text-sm text-gray-600">
          <p>
            {t('checkoutScreen.modalQr.total')}{' '}
            <span className="font-bold">
              {currency}
              {parseFloat(total).toFixed(2)}
            </span>
          </p>
        </div>

        <div className="flex justify-center mb-4">
          {loading ? (
            <p>{t('checkoutScreen.modalQr.loadingGenerating')}</p>
          ) : qrCode ? (
            <img src={qrCode} alt="QR Code" className="w-80 h-80" />
          ) : (
            <p>{t('checkoutScreen.modalQr.notGenerating')}</p>
          )}
        </div>

        <div className={`flex justify-center mb-4 text-center text-sm font-medium ${color}`}>
          <p>{t(messageKey)}</p>
        </div>

        <div className="flex justify-end gap-4">
          {status !== STATE.SUCCESS && (
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              {t('checkoutScreen.modalQr.cancelButton')}
            </button>
          )}
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-emerald-500 text-white rounded"
            disabled={loading || !qrCode}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalQrPayment;
