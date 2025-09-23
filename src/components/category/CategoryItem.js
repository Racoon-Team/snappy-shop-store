import React from 'react';

const CategoryItem = ({
  category,
  level = 0,
  selectedCategories = [],
  toggleCategory = () => {},
  showingTranslateValue = () => '',
}) => (
  <div style={{ marginLeft: `${level * 20}px` }} className="mb-2">
    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded border border-gray-100">
      <input
        type="checkbox"
        checked={selectedCategories.includes(category._id)}
        onChange={() => toggleCategory(category._id)}
        className="w-4 h-4"
      />
      <span>{showingTranslateValue(category.description) || showingTranslateValue(category.name) || 'Sin nombre'}</span>
    </label>

    {category.children?.map((child) => (
      <CategoryItem
        key={child._id}
        category={child}
        level={level + 1}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        showingTranslateValue={showingTranslateValue}
      />
    ))}
  </div>
);

export default CategoryItem;
