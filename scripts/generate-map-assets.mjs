import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, ".tmp-natural-earth-countries.geojson");
const outDir = path.join(root, "public", "images");

const geo = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const colors = {
  water: "#dfeef0",
  waterDeep: "#cfe3e7",
  land: "#f6eedf",
  landAlt: "#f0e4d1",
  border: "#c7baa4",
  line: "#cf5639",
  ink: "#1d2745",
  muted: "#6d756f",
  cream: "#fffaf2",
};

function project([lon, lat], bounds, width, height) {
  const x = ((lon - bounds.west) / (bounds.east - bounds.west)) * width;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function bboxOfCoords(coords, box = { west: 180, east: -180, south: 90, north: -90 }) {
  if (typeof coords[0] === "number") {
    const [lon, lat] = coords;
    box.west = Math.min(box.west, lon);
    box.east = Math.max(box.east, lon);
    box.south = Math.min(box.south, lat);
    box.north = Math.max(box.north, lat);
    return box;
  }
  coords.forEach((item) => bboxOfCoords(item, box));
  return box;
}

function intersects(a, b) {
  return a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south;
}

function ringToPath(ring, bounds, width, height) {
  return ring
    .map((coord, index) => {
      const [x, y] = project(coord, bounds, width, height);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ") + " Z";
}

function geometryToPath(geometry, bounds, width, height) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringToPath(ring, bounds, width, height)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .flatMap((polygon) => polygon.map((ring) => ringToPath(ring, bounds, width, height)))
      .join(" ");
  }
  return "";
}

function featurePaths(bounds, width, height, highlightNames = []) {
  return geo.features
    .filter((feature) => intersects(bboxOfCoords(feature.geometry.coordinates), bounds))
    .map((feature, index) => {
      const name = feature.properties.NAME_EN || feature.properties.NAME || feature.properties.ADMIN;
      const highlight = highlightNames.includes(name);
      const fill = highlight ? "#f1dfc6" : index % 3 === 0 ? colors.land : colors.landAlt;
      return `<path d="${geometryToPath(feature.geometry, bounds, width, height)}" fill="${fill}" stroke="${colors.border}" stroke-width="1.15" vector-effect="non-scaling-stroke"/>`;
    })
    .join("\n");
}

function label(text, lon, lat, bounds, width, height, size = 18) {
  const [x, y] = project([lon, lat], bounds, width, height);
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${colors.ink}" opacity="0.72">${text}</text>`;
}

function dot(lon, lat, bounds, width, height, labelText, labelX, labelY) {
  const [x, y] = project([lon, lat], bounds, width, height);
  return `
    <path d="M${x},${y} L${labelX},${labelY}" fill="none" stroke="${colors.line}" stroke-width="2" stroke-dasharray="5 7" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y}" r="7" fill="${colors.line}" stroke="${colors.cream}" stroke-width="4"/>
    <g transform="translate(${labelX},${labelY})">
      <rect x="-76" y="-20" width="152" height="40" rx="20" fill="${colors.cream}" stroke="#eadfcc"/>
      <text x="0" y="6" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800" fill="${colors.ink}">${labelText}</text>
    </g>`;
}

function baseSvg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
  <defs>
    <radialGradient id="waterGlow" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#f7fbfa"/>
      <stop offset="60%" stop-color="${colors.water}"/>
      <stop offset="100%" stop-color="${colors.waterDeep}"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#5f6b5f" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="32" fill="url(#waterGlow)"/>
  <g filter="url(#softShadow)">
${body}
  </g>
</svg>
`;
}

function write(file, contents) {
  fs.writeFileSync(path.join(outDir, file), contents);
}

const asiaBounds = { west: 60, east: 150, south: -12, north: 55 };
const koreaBounds = { west: 124.2, east: 131.5, south: 32.2, north: 39.5 };
const jejuBounds = { west: 126.12, east: 127.05, south: 33.08, north: 33.62 };

const asiaLabels = [
  ["Mongolia", 103.5, 46.6, 17],
  ["China", 103.8, 34.2, 21],
  ["India", 79.5, 22.8, 19],
  ["Thailand", 101, 15.2, 14],
  ["Vietnam", 106.5, 16.2, 14],
  ["Philippines", 123.5, 12.6, 13],
  ["Indonesia", 114.5, -3.4, 14],
  ["Japan", 138.6, 37.7, 15],
];

write(
  "map-asia-pastel.svg",
  baseSvg(
    1200,
    760,
    "Pastel travel map of Asia with South Korea marked",
    `${featurePaths(asiaBounds, 1200, 760, ["South Korea"])}
    ${asiaLabels.map((item) => label(item[0], item[1], item[2], asiaBounds, 1200, 760, item[3])).join("\n")}
    ${dot(127.7669, 35.9078, asiaBounds, 1200, 760, "South Korea", 974, 186)}
    <text x="72" y="96" font-family="Cormorant Garamond, Georgia, serif" font-size="48" fill="${colors.ink}">Asia to Korea</text>
    <text x="74" y="132" font-family="Inter, Arial, sans-serif" font-size="15" fill="${colors.muted}">A calm travel map, with hondit's origin marked only in Korea.</text>`,
  ),
);

write(
  "map-korea-pastel.svg",
  baseSvg(
    900,
    760,
    "Pastel map of Korea with Jeju Island marked",
    `${featurePaths(koreaBounds, 900, 760, ["South Korea"])}
    ${label("Korean Peninsula", 127.2, 37.2, koreaBounds, 900, 760, 22)}
    ${dot(126.5312, 33.4996, koreaBounds, 900, 760, "Jeju Island", 242, 690)}
    <text x="54" y="82" font-family="Cormorant Garamond, Georgia, serif" font-size="44" fill="${colors.ink}">South Korea to Jeju</text>
    <text x="56" y="116" font-family="Inter, Arial, sans-serif" font-size="15" fill="${colors.muted}">Jeju sits south of the peninsula, held in sea, stone and wind.</text>`,
  ),
);

const southKorea = geo.features.find((feature) => feature.properties.NAME_EN === "South Korea" || feature.properties.NAME === "South Korea");
let jejuRings = [];
if (southKorea?.geometry?.type === "MultiPolygon") {
  jejuRings = southKorea.geometry.coordinates
    .flatMap((polygon) => polygon)
    .filter((ring) => intersects(bboxOfCoords(ring), jejuBounds));
}
if (!jejuRings.length) {
  jejuRings = [[
    [126.16, 33.31], [126.2, 33.39], [126.29, 33.47], [126.42, 33.53], [126.56, 33.56],
    [126.73, 33.55], [126.89, 33.49], [127.01, 33.37], [126.98, 33.25], [126.83, 33.17],
    [126.65, 33.13], [126.43, 33.14], [126.25, 33.2], [126.16, 33.31],
  ]];
}

const jejuPath = jejuRings.map((ring) => ringToPath(ring, jejuBounds, 1000, 690)).join(" ");
write(
  "map-jeju-field.svg",
  baseSvg(
    1000,
    690,
    "Pastel field guide map of Jeju Island",
    `<path d="${jejuPath}" fill="${colors.land}" stroke="${colors.border}" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <path d="${jejuPath}" fill="none" stroke="#fffaf2" stroke-width="7" opacity="0.55" vector-effect="non-scaling-stroke"/>
    <path d="M220 455 C340 398 430 402 522 344 C632 274 736 284 858 220" fill="none" stroke="#dacdb7" stroke-width="2" stroke-dasharray="8 12" opacity="0.55"/>
    <circle cx="444" cy="342" r="76" fill="#e7d9c1" opacity="0.42"/>
    <text x="502" y="356" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="42" fill="${colors.ink}" opacity="0.82">Hallasan</text>
    <text x="80" y="94" font-family="Cormorant Garamond, Georgia, serif" font-size="48" fill="${colors.ink}">Jeju Island</text>
    <text x="82" y="130" font-family="Inter, Arial, sans-serif" font-size="15" fill="${colors.muted}">Coordinates are projected from real latitude and longitude.</text>`,
  ),
);

write(
  "ATTRIBUTION.md",
  `# Image and Map Attribution

- Asia and Korea country outlines are derived from Natural Earth Admin 0 country data. Natural Earth data is public domain: https://www.naturalearthdata.com/
- Jeju place coordinates are maintained as WGS84 latitude/longitude values for map placement in the hondit field guide.
- Product and brand imagery in this folder is supplied for the hondit project and should be used only for this site.
`,
);
