import { calculateSniper } from './Sniper';

export default (weaponType, location, angle, enemies) => {
  switch (weaponType) {
    case 'Sniper':
      return calculateSniper(location, angle, enemies);
      break;
  }
}

