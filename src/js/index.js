const startBtn = document.querySelector('#start');
const mapBlock = document.getElementById('map');
let myMap;
let clusterer;

function VKinit() {
  VK.init({
    apiId: 6668767
  });

  return new Promise((resolve, reject) => {
    VK.Auth.login(data => {
      if(data.session) {
        resolve();
      } else {
        reject(new Error("Auth failed"));
      }
    });
  });
}

function callAPI(method, options = {}) {
  const version = 5.85;

  options.v = version;

  return new Promise((resolve, reject) => {
    VK.Api.call(method, options, data => {
      if(data.error) {
        reject(data.error);
      }

      resolve(data.response);
    });
  });
}

function getCoords(address) {
  return ymaps.geocode(address, {
    results: 1
  })
    .then((res) => {
      let coords = res.geoObjects.get(0).geometry.getCoordinates();
      return coords;
    });
}

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  mapBlock.style.display = 'block';

  new Promise(resolve => ymaps.ready(resolve))
    .then(() => {
      VKinit();
    })
    .then(() => {
      return callAPI('friends.get', {
        fields: 'country,city'
      });
    })
    .then((friends) => {
      // Инициализация карты
      myMap = new ymaps.Map(mapBlock, {
        center: [47.838796, 35.139561],
        zoom: 8
      });
      myMap.setType('yandex#map');

      clusterer = new ymaps.Clusterer({
        //настройка иконок кластера
        preset: 'islands#invertedDarkBlueClusterIcons',
        hasBallon: false,
        hasHint: false
      });

      return friends.items;
    })
    .then(friends => {
      const promises = friends
        .filter((n) => n.city && n.country)
        .map(n => {
          let address = `${n.country.title} ${n.city.title}`;
          return address;
        })
        .map(n => {
          return getCoords(n);
        });

      return Promise.all(promises);
    })
    .then(coords => {
      const placemarks = coords.map(n => {
        return new ymaps.Placemark(n, {
          preset: 'islands#blueHomeCircleIcon'
        });
      });

      clusterer.add(placemarks);
      myMap.geoObjects.add(clusterer);
    })
    .catch(e => console.error(e));
});
