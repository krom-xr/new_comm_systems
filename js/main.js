/*global angular, _ */
angular.module('TEST', [])
    .controller('ItemsCtrl', function($scope, MoviesSrv) {
        MoviesSrv.prepareData();
        $scope.items = MoviesSrv.data;

    })
    .controller('SelectPropCtrl', function($scope, PropertiesSrv) {

        $scope.properties = PropertiesSrv;

    })
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
            
        }
        return movies;
    })
    .service('PropertiesSrv', function(MoviesSrv) {
        var genre_list = [
            { name: 'Ужасы',   color: 'red'},
            { name: 'Комедия', color: 'green'},
            { name: 'Драма',  color: 'blue'},
            { name: 'Боевик',  color: 'orange'},
        ]
        var properties = {
            list: [
                { name: 'genre', title: 'Жанр', value: genre_list },
                { name: 'artists', title: 'Актер', value: [] },
                { name: 'country', title: 'Страна', value: [] }
            ],
            selected: false,
            property_value: {},
            change: function() {
                MoviesSrv.paintMovies(properties.selected, properties.property_value);
            }
        };
        return properties
    })
    .directive('blockList', function() {
        return {
            templateUrl: "block_list.html",
            replace: true,
            restrict: 'EA',
            scope: { items: "="},
            link: function(scope, element, attrs) { }
        }
    })
    .directive('dragItem', function() {
        var $document = $(document);
        return function(scope, element, attrs) {
            var item = scope.$eval(attrs.dragItem);
            var $holder = element.closest('.blocks-holder');

            element.on('mousedown', function(e) {
                item.active = true;

                // вешаем на document, потому что иногда мышь двигается слишком быстро, и element перестает слушать событие mousemove
                $document.on('mousemove', function(e) {
                    if (!item.active) { return; }
                    item.left = e.clientX - element.width()/2 - $holder.position().left;
                    item.top = e.clientY - 30 + $holder.scrollTop();

                    if (item.top < 0) { item.top = 0; }
                    if (item.left < 0) { item.left = 0; }
                    if (item.left > $holder.width() - element.width()) { item.left = $holder.width() - element.width(); }
                    scope.$apply();
                });

                $document.on('mouseup', function(e) {
                    item.active = false;
                    $document.off('mouseup').off('mousemove');
                });

            });
        }
    })

    .directive('initDomElPosition', function() {
        return function(scope, element, attrs) {

            //TODO тут хак. Не придумал как проверить что весь дом уже сформировался
            setTimeout(function() {
                var $blocks = element.children();
                var $holder = element.closest('.blocks-holder');
                $blocks.each(function(i, block) {
                    var $block = $(block);
                    var position = $block.position();
                    $block.css('left', position.left + 'px');
                    $block.css('top', position.top + $holder.scrollTop() + 'px');
                });
                $blocks.css('position', 'absolute');

                $blocks.each(function(i, block) {
                    for (var j = i + 1; j < $blocks.length; j++) {
                        var block2 = $blocks[j];
                        if (block === block2) { return; }
                        if (block2.style.left === block.style.left) {
                            //block2.style.top = parseInt(block.style.top) + $(block).height() + 10 + 'px';
                            block2.style.top = parseInt(block.style.top) + block.offsetHeight + 20 + 'px';
                        }
                    };
                });

            }, 1000);
        }
    })

    .directive('liCutter', function() {
        function hideList($list, cut_length) {
            $list.each(function(i, li) {
                var $li = $(li);
                if (i + 1 > cut_length && !$li.hasClass('li-show-hide')) {
                    $(li).hide();
                }
            });
        }
        return function(scope, element, attrs) {
            var $li_show_hide = $("<li class='li-show-hide _show'>...<span class='glyphicon glyphicon-eye-open'></span><span class='glyphicon glyphicon-eye-close'></span></li>");
            var cut_length = attrs.liCutter;

            $li_show_hide.on('click', function() { 
                if ($li_show_hide.hasClass("_show")) {
                    $li_show_hide.removeClass("_show").addClass("_hide");
                    element.children().show();
                } else {
                    $li_show_hide.removeClass("_hide").addClass("_show");
                    hideList(element.children(), cut_length);
                }
            });

            var watch = scope.$watch(function() {
                var $list = element.children();
                if ($list.length > cut_length) {
                    hideList($list, cut_length);
                    element.append($li_show_hide);
                    watch();
                }
            });
        }
    })
    .directive('specialBind', function() {
        return {
            replace: true,
            scope: true,
            templateUrl: 'special_bind.html',
            link: function(scope, element, attrs) {
                var bind_ob = scope.$eval(attrs.specialBind);
                if (_.isString(bind_ob)) {
                    scope.type = 'string';
                    scope.bind_ob = bind_ob;
                } else if (_.isArray(bind_ob)) {
                    scope.type = 'array';
                    scope.bind_ob = bind_ob;
                }
            }
        } 
    })
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

            }
            return names[name];
        };
    });
