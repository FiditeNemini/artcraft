export enum CATEGORY {
  NONE = "none",
  BLOG = "blog",
  NEWS = "news",
}

type CategoryType = {
  name: CATEGORY,
  displayName: string,
  slug: string,
};

export const Category:{[key:string]:CategoryType} = {
  NONE:{
    name: CATEGORY.NONE,
    displayName: "No Category",
    slug: "/"
  },
  BLOG: {
    name: CATEGORY.BLOG,
    displayName: "Blog",
    slug: "/"
  },
  NEWS: {
    name: CATEGORY.NEWS,
    displayName: "Press Releases",
    slug: "/news"
  }
}

export const getCateogry = (cateoryName:string|undefined|null) => {
  const resultCategory = Object.values(Category).find((category)=>category.name === cateoryName);
  if(!resultCategory){
    return Category.NONE;
  }
  return resultCategory;
}