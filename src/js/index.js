window.onload = function () {
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
          reject(new Error('Auth failed'));
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
        return VKinit();
      })
      .then(() => {
        return callAPI('friends.get', {
          fields: 'country,city,photo_200'
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
          clusterDisableClickZoom: true,
          clusterBalloonContentLayoutWidth: 450,
          clusterBalloonContentLayoutHeight: 300,
          clusterBalloonLeftColumnWidth: 230
        });

        return friends.items;
      })
      .then(friends => {
        const friendsList = friends.filter((n) => n.city && n.country);
        const promises = friendsList
          .map(n => {
            let address = `${n.country.title} ${n.city.title}`;
            return address;
          })
          .map(n => {
            return getCoords(n);
          });

        return Promise.all(promises)
          .then((coords) => {
            for(let i = 0; i < friendsList.length; i++) {
              friendsList[i].address = coords[i];
            }
            return friendsList;
          });
      })
      .then(friends => {
        console.log(friends);
        const placemarks = friends.map(n => {
          return new ymaps.Placemark(n.address, {
            preset: 'islands#blueHomeCircleIcon',
            balloonContentHeader: `<div class="nickname">${n.first_name} ${n.last_name}</div>`,
            balloonContentBody: `
            <a class="profile-link" target="_blank" href="https://vk.com/id${n.id}">link</a>
            <br>
            <img class="avatar-in-balloon" src="${n.photo_200}" alt="avatar">`
          });
        });

        clusterer.add(placemarks);
        myMap.geoObjects.add(clusterer);
      })
      .catch(e => console.error(e));
  });
}

