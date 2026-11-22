// VelvetChipRandom — a small seeded generator so staged shots are reproducible.

function velvetMulberry32(seed) {
  let a = seed >>> 0;
  return function nextVelvetRandom() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function velvetPick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function velvetRange(rng, min, max) {
  return min + rng() * (max - min);
}

function velvetInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
