import React from 'react';
import { FiTruck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const InputShipping = ({ register, value, time, cost, currency, description, label, handleShippingCost }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="p-3 card border border-gray-200 bg-white rounded-md">
        <label className="cursor-pointer label">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3 text-gray-400">
                <FiTruck />
              </span>
              <div>
                <h6 className="font-serif font-medium text-sm text-gray-600">{label}</h6>

                <p className="text-xs text-gray-500 font-medium">
                  {description}
                  {cost && !isNaN(parseFloat(cost)) && (
                    <span className="font-medium text-gray-600">
                      {currency}
                      {parseFloat(cost).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <input
              type="radio"
              {...register(`shippingOption`, {
                required: t('checkoutScreen.validationShipping'),
              })}
              name="shippingOption"
              value={value}
              onChange={() => handleShippingCost(cost)}
              className="form-radio outline-none focus:ring-0 text-emerald-500"
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default InputShipping;
