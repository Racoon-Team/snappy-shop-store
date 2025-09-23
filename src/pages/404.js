import React, { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const router = useRouter();
  const { t } = useTranslation();
  // console.log("router", router.asPath);

  useEffect(() => {
    const pathLocale = router?.asPath?.split('/')[1]; // Get the current locale from the router
    if (!router?.locales?.includes(pathLocale)) {
      router.replace('/'); // Redirect to the home page if the locale is not supported
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>{t('page404Screen.title')}</title>
        <meta name="description" content="This is page not found 404 page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="px-6 py-10 lg:py-20 bg-emerald-50 h-screen flex flex-wrap content-center">
        <div className="block justify-items-stretch mx-auto items-center text-center">
          <Image width={650} height={450} src="/404.svg" alt="logo" />
          <h2 className="font-bold font-serif font-2xl lg:text-4xl leading-6 mb-4">{t('page404Screen.message')}</h2>
          <p className="block text-center text-base font-sans text-gray-600">{t('page404Screen.paragraph')}</p>

          <Link
            href="/"
            className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-6 text-sm lg:text-base w-full sm:w-auto"
          >
            {t('page404Screen.home')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
