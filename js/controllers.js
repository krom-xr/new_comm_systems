/*global angular, _, data*/
angular.module('TEST')
    .controller('ItemsCtrl', function($scope, MoviesSrv) {
        MoviesSrv.prepareData();
        $scope.items = MoviesSrv.data;

    })
    .controller('SelectPropCtrl', function($scope, PropertiesSrv) {

        $scope.properties = PropertiesSrv;

    });
