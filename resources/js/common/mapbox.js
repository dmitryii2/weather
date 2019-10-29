export default {

    config: {
        MapBox: {
            accessToken: 'pk.eyJ1IjoiZG1pdHJpajIiLCJhIjoiY2syYWh4ZHR4M3FvNTNobXYwOGpucmZpNCJ9.6iQcK1Wzr3ypbiGD7daKzw',
        },
        Yandex: {
            apiKey: '6444b16e-68c9-4951-a2ac-20b498afe6bf',
        },
    },

    init() {
        const { mapboxgl } = window;
        mapboxgl.accessToken = this.config.MapBox.accessToken;
        this.map = new mapboxgl.Map({
            container: 'map',
            center: [55.958727, 54.735147],
            zoom: 13,
            style: 'mapbox://styles/mapbox/streets-v11',
            pitchWithRotate: false,
            dragRotate: false,
            hash: true,
            transformRequest: (url, resourceType) => {
                if (resourceType === 'Source' && url.startsWith('http://myHost')) {
                    return {
                        url: url.replace('http', 'https'),
                        headers: {'my-custom-header': true},
                        credentials: 'include'  // Include cookies for cross-origin requests
                    }
                }
            }
        });

        this.map.on('load', () => this.onLoad());
    },

    onLoad() {
        this.addSources();
        this.map.on('moveend', () => this.moveEnd());
    },

    addSources() {
        this.areaData = {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[]]
            }
        };

        this.map.addSource('area', {
            type: 'geojson',
            data: this.areaData,
        });

        this.map.addLayer({
            'id': 'areaLayer',
            'type': 'fill',
            'source': 'area',
            'layout': {},
            'paint': {
                'fill-color': '#884530',
                'fill-opacity': 0.2
            }
        });

        this.pointData = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [],
                },
                "properties": {
                    "title": "Погода в городе: 1",
                    "icon": "beach"
                }
            }]
        };

        this.map.addSource('point', {
            type: 'geojson',
            data: this.pointData,
        });

        this.map.addLayer({
            "id": "pointLayer",
            "type": "symbol",
            "source": 'point',
            "layout": {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });
    },

    moveEnd() {

        // извлекаем широту и долготу из карты (а именно из центра карты)
        const { lat, lng } = this.map.getCenter();

        // тут я юзанул яндексовский реверс-геокодер, так как у мапбокса геокодер не выдает города России
        // передаем широту, долготу, а также ключ
        fetch(`https://geocode-maps.yandex.ru/1.x?geocode=${lng},${lat}&apikey=${this.config.Yandex.apiKey}&format=json`)
            .then(res => res.json())
            .then(({ response }) => {
                console.log(response);
                // Ищем город в ответе
                const city = response
                    .GeoObjectCollection
                    .featureMember
                    .find(x => x.GeoObject.metaDataProperty.GeocoderMetaData.kind === 'locality');

                // ищем область
                const province = response
                    .GeoObjectCollection
                    .featureMember
                    .find(x => x.GeoObject.metaDataProperty.GeocoderMetaData.kind === 'province');

                // Если город не найден, выходим
                if (city === undefined) return;

                const provinceName = province.GeoObject.metaDataProperty.GeocoderMetaData.text;
                const cityName = city.GeoObject.name;

                // Извлекаем границы города
                const bboxData = city.GeoObject.boundedBy.Envelope;
                const lbbox = bboxData.lowerCorner.split(' ');
                const ubbox = bboxData.upperCorner.split(' ');
                let bbox = [parseFloat(lbbox[1]), parseFloat(lbbox[0]), parseFloat(ubbox[1]), parseFloat(ubbox[0])];

                // запихиваем новые координаты в переменную с данными для ресурса, который выделяет территорию
                this.areaData.geometry.coordinates = [[
                    [bbox[1], bbox[0]], [bbox[3], bbox[0]],
                    [bbox[3], bbox[2]], [bbox[1], bbox[2]],
                    // так как это полигоны, требуется добавить еще одну точку (с которой начинали отрисовку)
                    [bbox[1], bbox[0]],
                ]];

                // апдейтим source
                this.map.getSource('area').setData(this.areaData);

                // теперь нужно выставить метку по середине с названием города
                this.pointData.features[0].properties.title = cityName;
                // здесь используется самая обычная формула для нахождения середины в нашем bBox-е
                this.pointData.features[0].geometry.coordinates = [
                    bbox[1] + (bbox[3] - bbox[1]) / 2,
                    bbox[0] + (bbox[2] - bbox[0]) / 2
                ];

                // апдейтим сурс
                this.map.getSource('point').setData(this.pointData);

                // получаем координаты города
                const cityPoints = city.GeoObject.Point.pos.split(' ');

                // и вызываем cb для вьюхи
                this.callback({
                    city: cityName,
                    province: provinceName,
                    lat: cityPoints[1],
                    lng: cityPoints[0],
                });

            });

    },

    selected(callback) {
        this.callback = callback;
    },

    setWeather(temp) {
        this.pointData.features[0].properties.title += `\n${temp}°C`;

        // апдейтим сурс
        this.map.getSource('point').setData(this.pointData);
    },
};
