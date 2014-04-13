/*global _, angular */
angular.module('TEST')
    .filter('get_key_name', function() {
        return function(name) {
            var names = {
                genre: 'Жанр',
                year: 'Год',
                artists: 'Актеры',
                country: 'Страна',
                director: 'Режиссер',
                scenario: 'Сценарий',
                producer: 'Продюсер'

            };
            return names[name];
        };
    });
