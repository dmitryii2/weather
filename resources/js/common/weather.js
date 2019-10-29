export default {

    appid: '8c8a4934e38079b605a1e6f8f78e3a81',
    units: 'metric',

    get(lat, lng) {
        return new Promise(r => {
            fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.appid}&units=${this.units}`)
                .then(res => res.json())
                .then(res => r(res.main.temp));
        });
    },

    getHistory(city, province) {
        return new Promise(r => {
            fetch(`/api/history?province=${province}&name=${city}`, {
                headers: {
                    Accept: 'application/json'
                }
            })
                .then(res => res.json())
                .then(res => r(res));
        });
    }

};
