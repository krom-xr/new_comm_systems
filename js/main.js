/*global angular, _ */
angular.module('TEST', [])
    .controller('ItemsCtrl', function($scope) {
        $scope.items = data;

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
            element.on('mousedown', function(e) {
                item.active = true;

                // вешаем на document, потому что иногда мышь двигается слишком быстро, и element перестает слушать событие mousemove
                $document.on('mousemove', function(e) {
                    if (!item.active) { return; }
                    item.left = e.clientX - element.width()/2;
                    item.top = e.clientY - 30;
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
            element.one('mousedown', function(e) {
                var $blocks = element.children();
                $blocks.each(function(i, block) {
                    var $block = $(block);
                    var position = $block.position();
                    console.log(position);
                    $block.css('left', position.left + 'px');
                    $block.css('top', position.top + 'px');
                });
                $blocks.css('position', 'absolute');
            });
            //var watch =  scope.$watch(function() {
                //var $blocks = element.children();
                //if ($blocks.length) {

                    //$blocks.one('mousedown', function() {
                        //console.log('wtf');
                    //});
                    //watch();
                //}
            //});
            //element.children().one('mousedown', function() {
                //console.log('wtf');
                //$(this).css('position', 'absolute');
            //});
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

            scope.$watch(function() {
                var $list = element.children();
                if ($list.length > cut_length) {
                    hideList($list, cut_length);
                    element.append($li_show_hide);
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
