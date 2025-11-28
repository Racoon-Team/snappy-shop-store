import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoClose } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
//internal import
import { pages } from '@utils/data';
import Loading from '@components/preloader/Loading';
import { SidebarContext } from '@context/SidebarContext';
import CategoryServices from '@services/CategoryServices';
import CustomerServices from '@services/CustomerServices';
import CategoryCard from '@components/category/CategoryCard';
import useUtilsFunction from '@hooks/useUtilsFunction';
import { useDispatch, useSelector } from 'react-redux';
import { setPreferences, setUserLocation } from '@redux/slice/preferencesSlice';

const Category = () => {
  const { categoryDrawerOpen, closeCategoryDrawer } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.preferences.userCategories);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data, error, isLoading } = useQuery({
    queryKey: ['category'],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);

      const res = await CustomerServices.getCustomerByEmail(email);
      const prefs = res?.preferences || [];
      const location = res?.location || null;

      dispatch(setPreferences(prefs));
      dispatch(setUserLocation(location));
      localStorage.setItem('userPreferences', JSON.stringify(prefs));
      if (location) {
        localStorage.setItem('userLocation', location);
      }
    };

    fetchPreferences();
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-white cursor-pointer scrollbar-hide">
      {categoryDrawerOpen && (
        <div className="w-full flex justify-between items-center h-16 px-6 py-4 bg-emerald-500 text-white border-b border-gray-100">
          <h2 className="font-semibold font-serif text-lg m-0 text-heading flex align-center">
            <Link href="/" className="mr-10">
              <Image width={100} height={38} src="/logo/logo-color.svg" alt="logo" />
            </Link>
          </h2>
          <button
            onClick={closeCategoryDrawer}
            className="flex text-xl items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-red-500 p-2 focus:outline-none transition-opacity hover:text-red-600"
            aria-label="close"
          >
            <IoClose />
          </button>
        </div>
      )}
      <div className="w-full max-h-full">
        {categoryDrawerOpen && (
          <h2 className="font-semibold font-serif text-lg m-0 text-heading flex align-center border-b px-8 py-3">
            {t('sidebarScreen.title.allCategorie')}
          </h2>
        )}
        {isLoading ? (
          <Loading loading={isLoading} />
        ) : error ? (
          <p className="flex justify-center align-middle items-center m-auto text-xl text-red-500">
            {error?.response?.data?.message || error?.message}
          </p>
        ) : (
          <div className="relative grid gap-2 p-6">
            {data[0]?.children
              ?.filter((category) => {
                if (!isLoggedIn) return true;
                const hasMatchingId = (cat) => {
                  if (preferences.includes(cat._id)) return true;
                  if (cat.children?.length) {
                    return cat.children.some((child) => hasMatchingId(child));
                  }
                  return false;
                };

                return hasMatchingId(category);
              })
              .map((category) => (
                <CategoryCard
                  key={category._id}
                  id={category._id}
                  icon={category.icon}
                  nested={category.children}
                  title={showingTranslateValue(category.name)}
                  preferences={preferences}
                  isLoggedIn={isLoggedIn}
                />
              ))}
          </div>
        )}

        {categoryDrawerOpen && (
          <div className="relative grid gap-2 mt-5">
            <h3 className="font-semibold font-serif text-lg m-0 text-heading flex align-center border-b px-8 py-3">
              {t('sidebarScreen.title.pages')}
            </h3>
            <div className="relative grid gap-1 p-6">
              {pages.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="p-2 flex font-serif items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600"
                >
                  <item.icon className="flex-shrink-0 h-4 w-4" aria-hidden="true" />
                  <p className="inline-flex items-center justify-between ml-2 text-sm font-medium w-full hover:text-emerald-600">
                    {t(`sidebarScreen.pages.${item.title}`)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
