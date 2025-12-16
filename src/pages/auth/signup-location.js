import Link from 'next/link';
import { FiLock, FiMail, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setUserLocation } from '@redux/slice/preferencesSlice';
import { useTranslation } from 'react-i18next';
//internal import
import Layout from '@layout/Layout';
import Error from '@components/form/Error';
import InputArea from '@components/form/InputArea';
import useLoginSubmit from '@hooks/useLoginSubmit';
import requests from '@services/httpServices';
import BottomNavigation from '@components/login/BottomNavigation';
import AdminServices from '@services/AdminServices';
import CustomerServices from '@services/CustomerServices';
const SignUpLocation = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { handleSubmit, submitHandler, register, errors, loading } = useLoginSubmit();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await AdminServices.getAvailableLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error getting locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const onSubmit = async (formData) => {
    try {
      await submitHandler(formData);
      dispatch(setUserLocation(formData.location));
      router.push('/auth/category-preference-registration');
    } catch (error) {
      console.error('Error al registrar ubicación:', error);
    }
  };
  const handleSkipLocation = async () => {
    try {
      const sessionEmail = localStorage.getItem('customerEmail');
      if (!sessionEmail) throw new Error('No email found');

      await CustomerServices.skipLocation({ email: sessionEmail });

      localStorage.setItem('skippedLocation', 'true');

      router.push('/auth/category-preference-registration');
    } catch (err) {
      console.error('Error skipping location:', err);
    }
  };

  return (
    <Layout title="Signup" description="this is sign up page">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-4 flex flex-col lg:flex-row w-full">
          <div className="w-full sm:p-5 lg:p-8">
            <div className="mx-auto text-left justify-center rounded-md w-full max-w-lg px-4 py-8 sm:p-10 overflow-hidden align-middle transition-all transform bg-white shadow-xl rounded-2x">
              <div className="overflow-hidden mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold font-serif">{t('locationRegistrationScreen.question')}</h2>
                  <p className="text-sm text-gray-500 mt-2 mb-8 sm:mb-10">
                    {t('locationRegistrationScreen.paragraph')}
                  </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center mb-6">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="form-group">
                      <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
                        {t('locationRegistrationScreen.department')}
                      </label>

                      {loadingLocations ? (
                        <p className="text-gray-500 text-sm">{t('locationRegistrationScreen.loading')}</p>
                      ) : locations.length === 0 ? (
                        <p className="text-red-500 text-sm font-medium">
                          {t('locationRegistrationScreen.noLocations')}
                        </p>
                      ) : (
                        <select
                          {...register('location', { required: true })}
                          name="location"
                          id="location"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">{t('locationRegistrationScreen.selectDepartment')}</option>
                          {locations.map((loc) => (
                            <option key={loc.key} value={loc.key}>
                              {loc.label}
                            </option>
                          ))}
                        </select>
                      )}

                      <Error errorName={errors.location} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex ms-auto"></div>
                    </div>

                    {loading ? (
                      <button
                        disabled={loading}
                        type="submit"
                        className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                      >
                        <img src="/loader/spinner.gif" alt="Loading" width={20} height={10} />
                        <span className="font-serif ml-2 font-light">{t('locationRegistrationScreen.processing')}</span>
                      </button>
                    ) : (
                      <button
                        disabled={locations.length === 0}
                        type="submit"
                        className={`w-full text-center py-3 rounded transition-all focus:outline-none my-1 ${
                          locations.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {t('locationRegistrationScreen.register')}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSkipLocation}
                      className="w-full text-center py-3 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all focus:outline-none my-1"
                    >
                      {t('locationRegistrationScreen.skip')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpLocation;
