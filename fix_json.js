const fs = require("fs");

async function fixJson() {
  const rawData = fs.readFileSync("cartier_catalog.json", "utf8");
  let products = JSON.parse(rawData);

  products = products.map(p => ({
    ref: p.ref.trim(),
    category: p.categorie, // Исправляем имя ключа
    name: p.title,
    price: p.price,
    tags: p.tags.split(", ").map(tag => tag.trim()), // Преобразуем в массив
    description: p.description,
    image: "https://www.cartier.com" + p.image // Добавляем полный URL
  }));

  fs.writeFileSync("cartier_catalog_fixed.json", JSON.stringify(products, null, 2));
  console.log("✅ JSON исправлен и сохранен в cartier_catalog_fixed.json");
}

fixJson();
