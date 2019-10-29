<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">WeatherMap</div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div id="map" style='width: 100%; height: 600px'></div>
                            </div>
                            <div class="col-md-6">
                                <div v-if="!isCitySelected">
                                    <p>Город не выбран.</p>
                                    <p>Приблизьте к нужному городу для получения информации</p>
                                </div>
                                <div v-else>
                                    <p><b>Область: </b>{{ province }}</p>
                                    <p><b>Город: </b>{{ city }}</p>
                                    <p><b>Широта: </b>{{ lat }}</p>
                                    <p><b>Долгота: </b> {{ lng }}</p>
                                    <p><b>Температура: </b> {{ temp }}°C</p>
                                    <div v-if="history.length">
                                        <p><b>Температура за пред. {{ history.length }} дней</b></p>
                                        <p v-for="h in history">{{ h.ts | moment('DD.MM.YYYY') }}: {{ h.temp }}°C</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import mapbox from '../common/mapbox';
    import weather from '../common/weather';
    export default {

        data: () => ({
            city: '',
            province: '',
            lat: 0,
            lng: 0,
            temp: 0,
            history: [],
        }),

        computed: {
            isCitySelected() {
                return this.city !== '';
            },
        },

        mounted() {
            mapbox.init();

            mapbox.selected((data) => {
                this.city = data.city;
                this.province = data.province;
                this.lat = data.lat;
                this.lng = data.lng;
                weather.get(data.lat, data.lng)
                    .then((temp) => {
                        this.temp = temp;
                        mapbox.setWeather(temp);
                    });
                weather.getHistory(data.city, data.province)
                    .then((history) => {
                        this.history = history;
                    });
            });
        }
    }
</script>
