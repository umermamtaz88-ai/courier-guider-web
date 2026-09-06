import type { ContextChip } from "@/types/api";

const WEIGHT_PATTERN =
  /(\d+(?:\.\d+)?)\s*(kg|kgs|kilograms?|g|grams?|lb|lbs|pounds?)/i;
const CITY_PATTERN =
  /\b(?:from|to|in)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/gi;

const KNOWN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Dubai",
  "Abu Dhabi",
  "London",
  "New York",
];

const PRODUCT_KEYWORDS: Record<string, string> = {
  clothes: "Clothing",
  clothing: "Clothing",
  garments: "Clothing",
  fabric: "Fabric",
  electronics: "Electronics",
  documents: "Documents",
  books: "Books",
  shoes: "Footwear",
  cosmetics: "Cosmetics",
  food: "Food items",
};

export function extractContextChips(text: string): ContextChip[] {
  const chips: ContextChip[] = [];
  const lower = text.toLowerCase();

  const weightMatch = text.match(WEIGHT_PATTERN);
  if (weightMatch) {
    chips.push({
      id: "weight",
      label: `${weightMatch[1]} ${weightMatch[2].toLowerCase().startsWith("k") ? "kg" : weightMatch[2]}`,
      value: weightMatch[0],
      type: "weight",
    });
  }

  for (const [keyword, label] of Object.entries(PRODUCT_KEYWORDS)) {
    if (lower.includes(keyword)) {
      chips.push({
        id: `product-${keyword}`,
        label,
        value: keyword,
        type: "product",
      });
      break;
    }
  }

  for (const city of KNOWN_CITIES) {
    if (lower.includes(city.toLowerCase())) {
      const isOrigin =
        lower.indexOf(`from ${city.toLowerCase()}`) !== -1 ||
        (lower.indexOf(city.toLowerCase()) < lower.indexOf(" to ") &&
          lower.includes(" to "));
      const isDest =
        lower.indexOf(`to ${city.toLowerCase()}`) !== -1 ||
        lower.lastIndexOf(city.toLowerCase()) >
          lower.lastIndexOf(" from ");

      if (isOrigin || (!isDest && chips.every((c) => c.type !== "origin"))) {
        if (!chips.some((c) => c.label === city && c.type === "origin")) {
          chips.push({
            id: `origin-${city}`,
            label: city,
            value: city,
            type: "origin",
          });
        }
      }
      if (isDest || lower.includes(`to ${city.toLowerCase()}`)) {
        if (!chips.some((c) => c.label === city && c.type === "destination")) {
          const existingOrigin = chips.find((c) => c.type === "origin");
          if (!existingOrigin || existingOrigin.label !== city) {
            chips.push({
              id: `dest-${city}`,
              label: city,
              value: city,
              type: "destination",
            });
          }
        }
      }
    }
  }

  const providers = ["TCS", "Leopards", "DHL", "FedEx", "BlueEx", "M&P"];
  for (const p of providers) {
    if (text.toUpperCase().includes(p.toUpperCase())) {
      chips.push({
        id: `provider-${p}`,
        label: p,
        value: p,
        type: "provider",
      });
    }
  }

  return chips;
}

export function updateChipInMessage(
  message: string,
  chip: ContextChip,
  newValue: string,
): string {
  if (chip.type === "weight") {
    return message.replace(WEIGHT_PATTERN, newValue);
  }
  return message.replace(new RegExp(chip.value, "i"), newValue);
}
