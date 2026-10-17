/* Supplied real product photographs (01_product_originals), shown under the main shot on the product page.
   Shared with the admin so the original five products open with the photos customers see today.
   Note: 01_diffuser_350_package.webp shows the 500g box despite its file name. */
export const productPhotoRoot = "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/";
export const productPhotos: Record<string, { file: string; width: number; height: number }[]> = {
  "diffuser-350g": [{ file: "03_diffuser_350_window.webp", width: 1256, height: 1114 }, { file: "04_diffuser_350_stone.webp", width: 1266, height: 1186 }, { file: "05_diffuser_350_shelf.webp", width: 1214, height: 1004 }],
  "diffuser-500g": [{ file: "07_diffuser_500_window.webp", width: 1138, height: 874 }, { file: "08_diffuser_500_wood.webp", width: 1126, height: 842 }, { file: "01_diffuser_350_package.webp", width: 1081, height: 1440 }],
  "foaming-cleanser": [{ file: "10_foaming_cleanser_pack.webp", width: 648, height: 930 }, { file: "11_foaming_cleanser_lifestyle.webp", width: 602, height: 756 }],
  "foam-oil": [{ file: "12_foam_oil_cleanser.webp", width: 544, height: 800 }],
  "cleansing-water": [{ file: "13_cleansing_water_pack.webp", width: 532, height: 736 }, { file: "14_cleansing_water_cutout.webp", width: 522, height: 886 }],
};
