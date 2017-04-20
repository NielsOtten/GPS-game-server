import { CONSTANTS, toRadians, unRadians } from './functions';
const sniperDistance = 200;

function calculateSniper(location, angle, enemies) {
  if (location == 'undefined' || location == null) return;

  // δ = d/R -- Afstand schot delen door aarde radius. (Cirkel rondom nul punt)
  // δ is Delta in het grieks.
  const δ = sniperDistance / CONSTANTS.earthRadians;
  // θ is thèta in het grieks.
  const θ = toRadians(angle);

  // Locatie naar radiale om makkelijker mee te rekenen.
  const φ1 = toRadians(location.lat);
  const λ1 = toRadians(location.long);

  // http://www.movable-type.co.uk/scripts/latlong.html#destPoint
  // Uiteindelijke locatie van het schot wordt hiermee berekent.
  // Hier komen de radiale van lat en long uit.
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

  // Radialen.
  const shotLat = unRadians(φ2);
  const shotLong = unRadians(λ2);

  // Variabele opstellen voor de formule om een rechte lijn te kunnen trekken.
  let Δlat = shotLat - location.lat;
  let Δlong = shotLong - location.long;

  // Je hebt hier te maken met een asymptoot. Hij zal dus nooit de 0 raken.
  // Daarom doen we de volgende dirty berekenen
  if (Δlat == 0) Δlat = 0.000000000000000001;
  if (Δlong == 0) Δlong = 0.000000000000000001;

  // Onderdeel van de formule om snijpunt te berekenen.
  // Dit moet variabel zijn, omdat de schot ook altijd variabel is.
  // Dit is de richtingscoeficient.
  const m = Δlat / Δlong;

  // Onderdeel van de formule om snijpunt te berekenen.
  // Dit moet variabel zijn, omdat de schot ook altijd variabel is.
  const n = shotLat - m * shotLong;

  let enemiesHit = [];
  if (enemies == 'undefined' && enemies == null && enemies.length <= 0) return;
  enemies.forEach(enemy => {
    if (location == 'undefined' || location == null
      || enemy.location == 'undefined' || enemy.location == null) return;

    // Hoek tot een persoon
    // Hiermee kun je een lijn tussen jouw locatie en de locatie van
    // de player opstellen.
    const φ2 = toRadians(enemy.location.lat);
    const Δλ = toRadians(enemy.location.long - location.long);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    // Waar ligt die persoon op die lijn, snijpunt met de lijn die we hebben berekent.
    const bearingToPlayer = (unRadians(θ) + 360) % 360;
    const lat = m * enemy.location.long + n;
    const long = (enemy.location.lat - n) / m;


    if (angle >= 45 && angle < 135 || angle >= 225 && angle < 315) {
      if (enemy.location.lat > lat - 0.0000270 &&
        enemy.location.lat < lat + 0.0000270 &&

        angle > bearingToPlayer - 150 &&
        angle < bearingToPlayer + 150) {
        enemiesHit.push(enemy);
        console.log('hit');
      }
    } else {
      // Breedte van het schot
      if (enemy.location.long > long - 0.000045 &&
        enemy.location.long < long + 0.000045 &&
        angle > bearingToPlayer - 150 &&
        angle < bearingToPlayer + 150) {
        enemiesHit.push(enemy);
        console.log('hit');
      }
    }
  });

  return enemiesHit;
}


export { calculateSniper };