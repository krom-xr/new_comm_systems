/*global angular, _, data*/
angular.module('TEST')
    .service('MoviesSrv', function() {
        var movies = {
            prepareData: function() {
                _.each(movies.data, function(movie) {
                    _.each(movie.properties, function(property, key) {
                        if (_.isString(property)) {
                            if (property.split(",").length > 1) {
                                movie.properties[key] = _.map(property.split(','), function(prop) { return $.trim(prop); });
                            }
                        }

                    });
                });
            },
            data: data,
            paintMovies: function(property, value) {
                if (!property) { return; }
                if (!_.include(property.value, value)) { return; }
                _.each(movies.data, function(movie) {
                    var movie_prop = movie.properties[property.name];
                    if (_.isString(movie_prop) && movie_prop === value.name || _.include(movie_prop, value.name)) {
                        movie.color = value.color;
                    } else {
                        movie.color = "";
                    }
                });
            }
            
        };
        return movies;
    })
    .service('PropertiesSrv', function(MoviesSrv) {
        var orange = "#FFA500",
            red = "#FF0000",
            green = "#008000",
            blue = "#0000FF",
            brown = "#A52A2A";

        var genre_list = [
            { name: 'Боевик',  color: orange},
            { name: 'Ужасы',   color: red},
            { name: 'Комедия', color: green},
            { name: 'Драма',  color: blue},
        ];
        var country_list = [
            { name: 'США',  color: red},
            { name: 'Великобритания',  color: blue},
            { name: 'Франция',  color: brown},
        ];
        var artists_list = [
            { name: 'Сигурни Уивер',  color: red},
            { name: 'Арнольд Шварценеггер',  color: blue},
            { name: 'Брэдли Купер',  color: brown},
            { name: 'Юэн МакГрегор',  color: orange},
        ];

        var properties = {
            list: [
                { name: 'genre', title: 'Жанр', value: genre_list },
                { name: 'country', title: 'Страна', value: country_list },
                { name: 'artists', title: 'Актер', value: artists_list },
            ],
            selected: false,
            property_value: {},
            change: function() {
                MoviesSrv.paintMovies(properties.selected, properties.property_value);
            }
        };
        return properties;
    });
