import React from 'react';
import dynamic from 'next/dynamic';
import { CardElement } from '@stripe/react-stripe-js';
import Link from 'next/link';
import { IoReturnUpBackOutline, IoArrowForward, IoBagHandle, IoWalletSharp } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

//internal import
import Layout from '@layout/Layout';
import Label from '@components/form/Label';
import Error from '@components/form/Error';
import CartItem from '@components/cart/CartItem';
import InputArea from '@components/form/InputArea';
import useGetSetting from '@hooks/useGetSetting';
import InputShipping from '@components/form/InputShipping';
import InputPayment from '@components/form/InputPayment';
import useCheckoutSubmit from '@hooks/useCheckoutSubmit';
import useUtilsFunction from '@hooks/useUtilsFunction';
import SettingServices from '@services/SettingServices';
import SwitchToggle from '@components/form/SwitchToggle';
import { useState } from 'react';
import { FaQrcode } from 'react-icons/fa';
import ModalQrPayment from '@components/modal/ModalQr';
import PaymentServices from '@services/PaymentServices';

const Checkout = () => {
  const { t } = useTranslation();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const userLocation = useSelector((state) => state.preferences.userLocation);
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { currency } = useUtilsFunction();

  const { data: storeSetting } = useQuery({
    queryKey: ['storeSetting'],
    queryFn: async () => await SettingServices.getStoreSetting(),
    staleTime: 4 * 60 * 1000,
  });
  const {
    data: deliveryPoints = [],
    isLoading: isLoadingDeliveryPoints,
    error: deliveryPointsError,
  } = useQuery({
    queryKey: ['deliveryPoints'],
    queryFn: SettingServices.getDeliveryPoints,
    staleTime: 4 * 60 * 1000,
  });
  const filteredDeliveryPoints = deliveryPoints.filter((point) => point.location === userLocation);

  const {
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    register,
    errors,
    showCard,
    setShowCard,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    handleDefaultShippingAddress,
    getValues,
    setValue,
  } = useCheckoutSubmit();

  useEffect(() => {
    if (session?.user) {
      setValue('fullName', session.user.name);
      setValue('email', session.user.email);
      setValue('contact', session.user.phone);
    }
  }, [session, setValue]);

  const handleGenerateQr = async () => {
    setModalOpen(true);
    setLoading(true);
    try {
      const { token } = await PaymentServices.getBankToken();
      const { qrImage } = await PaymentServices.createPaymentQr({
        token,
        amount: parseFloat(total).toFixed(2),
      });
      setQrCode(qrImage);
    } catch (error) {
      console.error('Error generando QR:', error.response?.data || error.message);
      setQrCode(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Layout title="Checkout" description="this is checkout page">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
          <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row">
            <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form
                  onSubmit={handleSubmit((data) => {
                    if (data.paymentMethod === 'QR') {
                      handleGenerateQr();
                    } else {
                      submitHandler(data, selectedDeliveryPoint);
                    }
                  })}
                >
                  {hasShippingAddress && (
                    <div className="flex justify-end my-2">
                      <SwitchToggle
                        id="shipping-address"
                        title="Use Default Shipping Address"
                        processOption={useExistingAddress}
                        handleProcess={handleDefaultShippingAddress}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                      01. {showingTranslateValue(storeCustomizationSetting?.checkout?.personal_details)}
                    </h2>

                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(storeCustomizationSetting?.dashboard?.full_name)}
                          name="fullName"
                          type="text"
                          placeholder="John"
                        />
                        <Error errorName={errors.fullName} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(storeCustomizationSetting?.checkout?.email_address)}
                          name="email"
                          type="email"
                          readOnly={true}
                          placeholder="youremail@gmail.com"
                        />
                        <Error errorName={errors.email} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(storeCustomizationSetting?.checkout?.checkout_phone)}
                          name="contact"
                          type="tel"
                          placeholder="+062-6532956"
                        />
                        <Error errorName={errors.contact} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mt-12">
                    <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                      02. {showingTranslateValue(storeCustomizationSetting?.checkout?.shipping_details)}
                    </h2>
                    <Label label={t('checkoutScreen.label')} />
                    <div className="grid grid-cols-6 gap-6">
                      {isLoadingDeliveryPoints ? (
                        <p className="col-span-6 text-gray-500">{t('checkoutScreen.loading')}</p>
                      ) : deliveryPointsError ? (
                        <p className="col-span-6 text-red-500">{t('checkoutScreen.errorLoading')}</p>
                      ) : filteredDeliveryPoints.length === 0 ? (
                        <div className="col-span-6 flex items-center justify-between gap-4">
                          <p className="text-gray-500">{t('checkoutScreen.text')}</p>
                          <Link
                            href={`user/update-profile`}
                            className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 transition-all rounded px-4 py-2 text-sm font-serif font-medium text-white shadow-md"
                          >
                            {t('checkoutScreen.buttonRegisterLocation')}
                          </Link>
                        </div>
                      ) : (
                        filteredDeliveryPoints.map((point) => (
                          <div key={point.id} className="col-span-6 sm:col-span-3">
                            <InputShipping
                              currency={currency}
                              handleShippingCost={(cost) => {
                                handleShippingCost(cost);
                                setSelectedDeliveryPoint(point.location);
                              }}
                              register={register}
                              name="shippingOption"
                              value={point.location}
                              cost={point.shippingCost}
                              label={point.placeName}
                              checked={selectedDeliveryPoint === point.location}
                            />

                            <Error errorName={errors.shippingOption} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="form-group mt-12">
                    <h2 className="font-semibold text-base text-gray-700 pb-3">
                      03. {showingTranslateValue(storeCustomizationSetting?.checkout?.payment_method)}
                    </h2>
                    {showCard && (
                      <div className="mb-3">
                        <CardElement /> <p className="text-red-400 text-sm mt-1">{error}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {storeSetting?.cod_status && (
                        <div className="">
                          <InputPayment
                            setShowCard={setShowCard}
                            register={register}
                            name={t('checkoutScreen.paymentMethodCash')}
                            value="Cash"
                            Icon={IoWalletSharp}
                          />
                          <Error errorMessage={errors.paymentMethod} />
                        </div>
                      )}

                      {storeSetting?.qr_status && (
                        <div className="">
                          <InputPayment
                            setShowCard={setShowCard}
                            register={register}
                            name={t('checkoutScreen.paymentMethodQr')}
                            value="QR"
                            Icon={FaQrcode}
                          />
                          <Error errorMessage={errors.paymentMethod} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
                    <div className="col-span-6 sm:col-span-3">
                      <Link
                        href="/"
                        className="bg-indigo-50 border border-indigo-100 rounded py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-800 hover:border-gray-300 transition-all flex justify-center font-serif w-full"
                      >
                        <span className="text-xl mr-2">
                          <IoReturnUpBackOutline />
                        </span>
                        {showingTranslateValue(storeCustomizationSetting?.checkout?.continue_button)}
                      </Link>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <button
                        type="submit"
                        disabled={isEmpty || isCheckoutSubmit || (showCard && !stripe)}
                        className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 transition-all rounded py-3 text-center text-sm font-serif font-medium text-white flex justify-center w-full"
                      >
                        {isCheckoutSubmit ? (
                          <span className="flex justify-center text-center">
                            <img src="/loader/spinner.gif" alt="Loading" width={20} height={10} />
                            <span className="ml-2">{t('common:processing')}</span>
                          </span>
                        ) : (
                          <span className="flex justify-center text-center">
                            {showingTranslateValue(storeCustomizationSetting?.checkout?.confirm_button)}
                            <span className="text-xl ml-2">
                              <IoArrowForward />
                            </span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                <ModalQrPayment
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  total={total}
                  currency="$"
                  qrCode={qrCode}
                  loading={loading}
                  onSuccess={() => {
                    const formValues = getValues();
                    submitHandler({ ...formValues, paymentMethod: 'QR' }, selectedDeliveryPoint);
                  }}
                />
              </div>
            </div>

            <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-28 md:order-2 lg:order-2">
              <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white order-1 sm:order-2">
                <h2 className="font-semibold font-serif text-lg pb-4">
                  {showingTranslateValue(storeCustomizationSetting?.checkout?.order_summary)}
                </h2>

                <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-64 bg-gray-50 block">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} currency={currency} />
                  ))}

                  {isEmpty && (
                    <div className="text-center py-10">
                      <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                        <IoBagHandle />
                      </span>
                      <h2 className="font-medium font-serif text-sm pt-2 text-gray-600">No Item Added Yet!</h2>
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
                  <form className="w-full">
                    {couponInfo.couponCode ? (
                      <span className="bg-emerald-50 px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                        {' '}
                        <p className="text-emerald-600">Coupon Applied </p>{' '}
                        <span className="text-red-500 text-right">{couponInfo.couponCode}</span>
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start justify-end">
                        <input
                          ref={couponRef}
                          type="text"
                          placeholder={t('checkoutScreen.couponCode')}
                          className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-emerald-500 placeholder-gray-500 placeholder-opacity-75"
                        />
                        {isCouponAvailable ? (
                          <button
                            disabled={isCouponAvailable}
                            type="submit"
                            className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                          >
                            <img src="/loader/spinner.gif" alt="Loading" width={20} height={10} />
                            <span className=" ml-2 font-light">Processing</span>
                          </button>
                        ) : (
                          <button
                            disabled={isCouponAvailable}
                            onClick={handleCouponCode}
                            className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                          >
                            {showingTranslateValue(storeCustomizationSetting?.checkout?.apply_button)}
                          </button>
                        )}
                      </div>
                    )}
                  </form>
                </div>
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                  {showingTranslateValue(storeCustomizationSetting?.checkout?.sub_total)}
                  <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                    {currency}
                    {cartTotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                  {showingTranslateValue(storeCustomizationSetting?.checkout?.shipping_cost)}
                  <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                    {currency}
                    {shippingCost?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                  {showingTranslateValue(storeCustomizationSetting?.checkout?.discount)}
                  <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                    {currency}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t mt-4">
                  <div className="flex items-center font-bold font-serif justify-between pt-5 text-sm uppercase">
                    {showingTranslateValue(storeCustomizationSetting?.checkout?.total_cost)}
                    <span className="font-serif font-extrabold text-lg">
                      {currency}
                      {parseFloat(total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });
