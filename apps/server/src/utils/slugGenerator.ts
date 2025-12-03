import slugify from "slugify";
import Package from "../models/package.model";

const generateUniqueSlug = async (title: string): Promise<string> => {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true, // removes special chars like &, *, etc.
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  // Keep trying until we find a unique slug
  while (await Package.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
export default generateUniqueSlug;
