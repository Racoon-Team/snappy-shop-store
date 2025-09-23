import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Layout from '@layout/Layout';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import useUtilsFunction from '@hooks/useUtilsFunction';
import CategoryServices from '@services/CategoryServices';
import CustomerServices from '@services/CustomerServices';
import { useQuery } from '@tanstack/react-query';
import SelectableCategoryCard from '@components/category/SelectableCategoryCard';
// import useTranslation from 'next-translate/useTranslation';
import { useTranslation } from 'react-i18next';

const SignUpCategoryPreferences = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  const { data: rawCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryServices.getAllCategories(),
  });

  // the hierarchical tree was made
  const buildCategoryTree = (flatList) => {
    const map = new Map();
    const roots = [];

    flatList.forEach((cat) => {
      if (cat.status !== 'show') return;

      map.set(cat._id, { ...cat, children: [] });
    });

    map.forEach((cat) => {
      if (map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(cat);
      } else if (cat.id === 'Root') {
        roots.push(cat);
      }
    });

    const homeRoot = roots.find((r) => r.id === 'Root');

    return homeRoot?.children || [];
  };

  useEffect(() => {
    if (!rawCategories.length) return;

    getSession().then(async (session) => {
      const email = session?.user?.email;
      if (!email) return;

      const user = await CustomerServices.getCustomerByEmail(email);
      if (user?.preferences?.length) {
        router.replace('/');
        return;
      }

      const tree = buildCategoryTree(rawCategories);
      setCategories(tree);

      const validIds = new Set(tree.map((cat) => cat._id));
      setSelectedCategories((prev) => prev.filter((id) => validIds.has(id)));
    });
  }, [rawCategories, router]);

  const handleRegister = async () => {
    try {
      const session = await getSession();
      const email = session?.user?.email;

      if (!email) {
        toast.error('No email found in session');
        return;
      }
      await CustomerServices.updateCustomerPreferences({
        email,
        preferences: selectedCategories,
      });

      toast.success(t('signUpPreferences.successMessage'), {
        position: 'top-center',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      toast.error('Error saving preferences. Please try again.', {
        position: 'top-center',
      });
    }
  };

  const handleToggleCategory = (ids) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      let changed = false;
      ids.forEach((id) => {
        if (newSet.has(id)) {
          newSet.delete(id);
          changed = true;
        } else {
          newSet.add(id);
          changed = true;
        }
      });
      return changed ? Array.from(newSet) : prev;
    });
  };
  return (
    <Layout title="Category Preferences" description="Select your preferences">
      <div className="mx-auto max-w-screen-md px-4 py-10">
        <div className="bg-white shadow-lg rounded-md p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">{t('signUpPreferences.question')}</h2>

          <div className="mb-6">
            {categories.map((category) => (
              <SelectableCategoryCard
                key={category._id}
                id={category._id}
                icon={category.icon}
                title={showingTranslateValue(category.name)}
                nested={category.children}
                selected={selectedCategories}
                onToggle={handleToggleCategory}
              />
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handleRegister}
              className="py-3 px-6 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all mx-auto block"
            >
              {t('signUpPreferences.registerBtn')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpCategoryPreferences;
