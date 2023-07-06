function decodeGeohash(geohash) {
  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

  let isEven = true;
  let lat = [-90, 90];
  let lon = [-180, 180];

  for (let i = 0; i < geohash.length; i++) {
    const ch = geohash[i];
    const idx = BASE32.indexOf(ch);

    for (let bit of BITS) {
      if (isEven) {
        refineInterval(lon, idx, bit);
      } else {
        refineInterval(lat, idx, bit);
      }
      isEven = !isEven;
    }
  }

  const latitude = (lat[0] + lat[1]) / 2;
  const longitude = (lon[0] + lon[1]) / 2;

  return { latitude, longitude };
}

function refineInterval(interval, index, bit) {
  if (index & bit) {
    interval[0] = (interval[0] + interval[1]) / 2;
  } else {
    interval[1] = (interval[0] + interval[1]) / 2;
  }
}
