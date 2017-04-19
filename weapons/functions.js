const CONSTANTS = {
  earthRadians: 6371000
};

function toRadians(int) {
  return int * Math.PI / 180;
}

function unRadians(int) {
  return int * 180 / Math.PI;
}

export { CONSTANTS, toRadians, unRadians};