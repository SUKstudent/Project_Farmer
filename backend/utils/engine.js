function engine({ waterLevel, lat }) {
  let region = "HKE Region";

  if (lat > 16 && lat < 18) region = "North Karnataka Dry Zone";

  return {
    region,
    crops: waterLevel === "Low"
      ? ["Jowar", "Millets", "Horse Gram"]
      : ["Groundnut", "Sunflower", "Pigeon Pea"],

    income: [
      "Goat Farming",
      "Beekeeping",
      "Dairy"
    ],

    women: [
      "Embroidery",
      "Diyas",
      "Cow dung products"
    ],

    message: "Arya optimized livelihood plan generated"
  };
}

module.exports = engine;