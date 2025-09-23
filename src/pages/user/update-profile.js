import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLocation } from '@redux/slice/preferencesSlice';
import { useTranslation } from 'react-i18next';

//internal import
import Label from '@components/form/Label';
import Error from '@components/form/Error';
import Dashboard from '@pages/user/dashboard';
import InputArea from '@components/form/InputArea';
import useGetSetting from '@hooks/useGetSetting';
import CustomerServices from '@services/CustomerServices';
import AdminServices from '@services/AdminServices';
import Uploader from '@components/image-uploader/Uploader';
import { notifySuccess, notifyError } from '@utils/toast';
import useUtilsFunction from '@hooks/useUtilsFunction';
import { useRouter } from 'next/router';

const UpdateProfile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const { data: session, update } = useSession();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    const userData = {
      name: data.name,
      email: data.email,
      address: data.address,
      phone: data.phone,
      location: data.location,
      image: imageUrl,
    };

    try {
      const res = await CustomerServices.updateCustomer(session?.user?.id, userData);
      setLoading(false);

      update({
        ...session,
        user: {
          ...session.user,
          name: data.name,
          address: data.address,
          phone: data.phone,
          location: data.location,
          image: imageUrl,
        },
      });

      notifySuccess('Profile Update Successfully!');
      router.push('/user/my-account');
    } catch (error) {
      setLoading(false);
      notifyError(error?.response?.data?.message || error?.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      try {
        const userData = await CustomerServices.getCustomerById(session.user.id);
        setValue('name', userData.name);
        setValue('email', userData.email);
        setValue('address', userData.address);
        setValue('phone', userData.phone);
        setValue('location', userData.location);
        setSelectedLocation(userData.location);
        setImageUrl(userData.image);
        dispatch(setUserLocation(userData.location));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [session?.user?.id, setValue, dispatch]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await AdminServices.getAvailableLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error getting locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSelectedLocation(value);
    setValue('location', value);
    dispatch(setUserLocation(value));
  };

  return (
    <Dashboard
      title={showingTranslateValue(storeCustomizationSetting?.dashboard?.update_profile)}
      description="This is edit profile page"
    >
      <div className="max-w-screen-2xl">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-serif font-semibold mb-5">
                {showingTranslateValue(storeCustomizationSetting?.dashboard?.update_profile)}
              </h2>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="bg-white space-y-6">
              <div>
                <Label label={t('updateProfile.photo')} />
                <div className="mt-1 flex items-center">
                  <Uploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
                </div>
              </div>
            </div>

            <div className="mt-10 sm:mt-0">
              <div className="md:grid-cols-6 md:gap-6">
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="lg:mt-6 mt-4 bg-white">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(storeCustomizationSetting?.dashboard?.full_name)}
                          name="name"
                          type="text"
                          placeholder={showingTranslateValue(storeCustomizationSetting?.dashboard?.full_name)}
                        />
                        <Error errorName={errors.name} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(storeCustomizationSetting?.dashboard?.address)}
                          name="address"
                          type="text"
                          placeholder={showingTranslateValue(storeCustomizationSetting?.dashboard?.address)}
                        />
                        <Error errorName={errors.address} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_phone)}
                          name="phone"
                          type="tel"
                          placeholder={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_phone)}
                        />
                        <Error errorName={errors.phone} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          name="email"
                          type="email"
                          readOnly={true}
                          defaultValue={session?.user?.email}
                          label={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_email)}
                          placeholder={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_email)}
                        />
                        <Error errorName={errors.email} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <Label label={t('updateProfile.department')} />
                        <select
                          {...register('location', { required: true })}
                          name="location"
                          value={selectedLocation}
                          onChange={handleLocationChange}
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">{t('updateProfile.selectDepartment')}</option>
                          {locations.map((loc) => (
                            <option key={loc.key} value={loc.key}>
                              {loc.label}
                            </option>
                          ))}
                        </select>
                        <Error errorName={errors.location} />
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-3 mt-5 text-right">
                      {loading ? (
                        <button
                          disabled={loading}
                          type="submit"
                          className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                        >
                          <img src="/loader/spinner.gif" alt="Loading" width={20} height={10} />
                          <span className="font-serif ml-2 font-light">Processing</span>
                        </button>
                      ) : (
                        <button
                          disabled={loading}
                          type="submit"
                          className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                        >
                          {showingTranslateValue(storeCustomizationSetting?.dashboard?.update_button)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Dashboard>
  );
};

export default UpdateProfile;
