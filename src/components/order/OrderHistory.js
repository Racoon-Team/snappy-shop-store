import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTranslation } from 'react-i18next';

dayjs.extend(localizedFormat);

const OrderHistory = ({ order, currency }) => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <td className="px-5 py-3 leading-6 whitespace-nowrap">
        <span className="uppercase text-sm font-medium">{order?._id?.substring(20, 24)}</span>
      </td>
      <td className="px-5 py-3 leading-6 text-center whitespace-nowrap">
        <span className="text-sm">{dayjs(order.createdAt).locale(i18n.language).format('LL')}</span>
      </td>

      <td className="px-5 py-3 leading-6 text-center whitespace-nowrap">
        <span className="text-sm">{t(`userScreen.myOrders.payment.${order.paymentMethod}`)}</span>
      </td>
      <td className="px-5 py-3 leading-6 text-center whitespace-nowrap font-medium text-sm">
        {order.status === 'Delivered' && <span className="text-emerald-500">{t(`common.table.${order.status}`)}</span>}
        {order.status === 'Pending' && <span className="text-orange-500">{t(`common.table.${order.status}`)}</span>}
        {order.status === 'Cancel' && <span className="text-red-500">{t(`common.table.${order.status}`)}</span>}
        {order.status === 'Processing' && <span className="text-indigo-500">{t(`common.table.${order.status}`)}</span>}
      </td>

      <td className="px-5 py-3 leading-6 text-center whitespace-nowrap">
        <span className="text-sm font-bold">
          {currency}
          {parseFloat(order?.total).toFixed(2)}
        </span>
      </td>
    </>
  );
};

export default OrderHistory;
