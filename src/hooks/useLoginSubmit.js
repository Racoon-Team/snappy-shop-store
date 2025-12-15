import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { getSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

//internal import

import { notifyError, notifySuccess } from '@utils/toast';
import CustomerServices from '@services/CustomerServices';

const useLoginSubmit = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const redirectUrl = useSearchParams().get('redirectUrl');

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = async (data) => {
    const { name, email, password, phone, location } = data;

    setLoading(true);

    try {
      if (router.pathname === '/auth/signup') {
        // Custom sign-up method

        // NOTE:Call the sign-up API which also handles sending the email verification
        const res = await CustomerServices.verifyEmailAddress({
          name,
          email,
          password,
        });

        notifySuccess(t('signupScreen.message'));

        return setLoading(false);
      } else if (router.pathname === '/auth/forget-password') {
        // Call the forget password API for reset password
        const res = await CustomerServices.forgetPassword({
          email,
        });

        notifySuccess(res.message);
        return setLoading(false);
      } else if (router.pathname === '/auth/phone-signup') {
        const res = await CustomerServices.verifyPhoneNumber({
          phone,
        });
        notifySuccess(res.message);

        return setLoading(false);
      } else if (router.pathname === '/auth/signup-location') {
        const session = await getSession();
        const email = session?.user?.email;

        if (!email) {
          throw new Error('No email found in session');
        }

        const { location } = data;

        const res = await CustomerServices.updateLocation({ email, location });
        notifySuccess(t('locationRegistrationScreen.notification'));
        router.push('/auth/category-preference-registration');
        return setLoading(false);
      } else {
        // Login logic (no changes)
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
          callbackUrl: '/user/dashboard',
        });

        if (result?.ok) {
          const user = await CustomerServices.getCustomerByEmail(email);

          localStorage.setItem('accessToken', result.token || 'dummy-token');
          localStorage.setItem('customerId', user._id);
          localStorage.setItem('customerEmail', user.email);

          if (!user.location && !user.locationSkipped) {
            router.push('/auth/signup-location');
            setLoading(false);
            return;
          }
          if (!user.preferences || user.preferences.length === 0) {
            router.push('/auth/category-preference-registration');
            setLoading(false);
            return;
          }

          router.push('/user/dashboard');
          setLoading(false);
        }
      }
    } catch (error) {
      // NOTE:Catch any unexpected errors here (e.g., network issues, unexpected API failures)
      console.error('Error in submitHandler:', error?.response?.data?.message || error?.message);
      setLoading(false);
      notifyError(t('forgetPasswordScreen.message') || error?.message);
    }
  };

  return {
    register,
    errors,
    loading,
    control,
    handleSubmit,
    submitHandler,
  };
};

export default useLoginSubmit;
