import { type Category } from "dist/bundle";

export const buildCategoryPaths = (
  categories: Category[],
): Map<number, Category[]> => {
  const idToCategory = new Map<number, Category>();

  categories.forEach((category) => {
    idToCategory.set(category.id, category);
  });

  const categoryPaths = new Map<number, Category[]>();

  categories.forEach((category) => {
    const path: Category[] = [];

    let currentCategory: Category | undefined = category;

    while (currentCategory) {
      path.unshift(currentCategory);

      if (currentCategory.parentId !== undefined) {
        currentCategory = idToCategory.get(currentCategory.parentId);
      } else {
        currentCategory = undefined;
      }
    }

    categoryPaths.set(category.id, path);
  });

  return categoryPaths;
};
