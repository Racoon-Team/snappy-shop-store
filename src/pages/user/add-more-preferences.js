import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Dashboard from './dashboard';
import SelectableCategoryCard from '@components/category/SelectableCategoryCard';
import CategoryServices from '@services/CategoryServices';
import CustomerServices from '@services/CustomerServices';
import { useQuery } from '@tanstack/react-query';
import useUtilsFunction from '@hooks/useUtilsFunction';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const AddMorePreferences = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { showingTranslateValue } = useUtilsFunction();
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category'],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const session = await getSession();
        const email = session?.user?.email;

        if (!email) {
          return;
        }
        const userData = await CustomerServices.getCustomerByEmail(email);
        if (userData?.preferences) {
          const preferences = userData.preferences.map((p) => String(p));
          setSelectedCategories(preferences);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserPreferences();
  }, []);

  const toggleCategory = (ids) => {
    setSelectedCategories((prev) => {
      const newSelected = [...prev];
      ids.forEach((id) => {
        if (newSelected.includes(id)) {
          const index = newSelected.indexOf(id);
          if (index > -1) newSelected.splice(index, 1);
        } else {
          newSelected.push(id);
        }
      });
      return newSelected;
    });
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email) {
        toast.error('User email not found.');
        return;
      }
      await CustomerServices.updateCustomerPreferences({
        email,
        preferences: selectedCategories,
      });
      toast.success(t('myAccount.addPreferencesCard.successMessage'), {
        position: 'top-center',
      });

      router.push('/user/my-account');
    } catch (error) {
      toast.error('Error updating preferences', {
        position: 'top-center',
      });
    }
  };

  return (
    <Dashboard title="add-shipping-address" description="This is my account page">
      <div className="max-w-screen-2xl">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-semibold mb-5">{t('myAccount.addPreferencesCard.label')}</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdatePreferences}>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="mt-10 sm:mt-0">
              <div className="md:grid-cols-6 md:gap-6">
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="lg:mt-6 mt-4 bg-white">
                    <div className="col-span-6 mt-10">
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        {isLoading ? (
                          <p className="text-sm text-gray-500">{t('myAccount.addPreferencesCard.loadingCategories')}</p>
                        ) : (
                          categoryData[0]?.children?.map((category) => (
                            <SelectableCategoryCard
                              key={category._id}
                              id={String(category._id)}
                              icon={category.icon}
                              title={showingTranslateValue(category.name)}
                              nested={category.children}
                              selected={selectedCategories}
                              onToggle={toggleCategory}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-3 mt-5 text-right">
                      <button
                        type="submit"
                        className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md bg-cyan-600 text-white px-5 py-3 hover:bg-cyan-700 h-12 w-full sm:w-auto"
                      >
                        {t('myAccount.addPreferencesCard.label')}
                      </button>
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

export default AddMorePreferences;
