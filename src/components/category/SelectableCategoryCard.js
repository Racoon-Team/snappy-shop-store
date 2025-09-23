import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { IoChevronDownOutline, IoChevronForwardOutline } from 'react-icons/io5';
import useUtilsFunction from '@hooks/useUtilsFunction';

const SelectableCategoryCard = ({ title, icon, nested, id, selected, onToggle }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const [show, setShow] = useState(false);
  const checkboxRef = useRef();

  const collectAllIds = (category) => {
    let ids = [category._id];
    if (category.children?.length > 0) {
      for (let child of category.children) {
        ids = ids.concat(collectAllIds(child));
      }
    }
    return ids;
  };

  useEffect(() => {
    if (!checkboxRef.current) return;
    if (nested?.length > 0) {
      const childIds = collectAllIds({ _id: id, children: nested }).filter((childId) => childId !== id);
      const selectedChildrenCount = childIds.filter((childId) => selected.includes(childId)).length;
      const allSelected = selectedChildrenCount === childIds.length;
      const someSelected = selectedChildrenCount > 0;
      checkboxRef.current.indeterminate = someSelected && !allSelected;
      if (allSelected && !selected.includes(id)) {
        onToggle([id]);
      }
      if (!someSelected && selected.includes(id)) {
        onToggle([id]);
      }
    } else {
      checkboxRef.current.indeterminate = false;
    }
  }, [selected, nested, id, onToggle]);

  const toggleCheckbox = () => {
    if (nested?.length > 0) {
      const allIds = collectAllIds({ _id: id, children: nested });
      onToggle(allIds);
    } else {
      onToggle([id]);
    }
  };

  return (
    <>
      <div
        onClick={() => setShow(!show)}
        className="p-2 flex items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600 cursor-pointer"
      >
        {icon ? (
          <Image src={icon} width={18} height={18} alt="Category" />
        ) : (
          <Image
            src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
            width={18}
            height={18}
            alt="category"
          />
        )}
        <div className="inline-flex items-center justify-between ml-3 text-sm font-medium w-full">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={selected.includes(id)}
              onChange={toggleCheckbox}
              onClick={(e) => e.stopPropagation()}
            />
            {title}
          </label>
          {nested?.length > 0 && (
            <span className="text-gray-400">{show ? <IoChevronDownOutline /> : <IoChevronForwardOutline />}</span>
          )}
        </div>
      </div>
      {show && nested?.length > 0 && (
        <ul className="pl-6 pb-3 pt-1 -mt-1">
          {nested.map((child) => (
            <li key={child._id}>
              <SelectableCategoryCard
                id={child._id}
                icon={child.icon}
                title={showingTranslateValue(child.name)}
                nested={child.children}
                selected={selected}
                onToggle={onToggle}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SelectableCategoryCard;
