<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WeatherMap</title>
        <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.js'></script>
        <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.css' rel='stylesheet'/>
    </head>
    <body>
        <div id="app" class="full-height">
            <div class="flex-center position-ref full-height">
                <example-component></example-component>
            </div>
        </div>
    </body>
    <script src="{{ asset('js/app.js') }}"></script>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</html>
