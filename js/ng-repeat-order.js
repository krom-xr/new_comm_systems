/* global angular */

// TODO need to be analize and refactoring
// TODO сделатьтак чтобы если order_list пустой - то выдавалась ошибка

//HACK это некая заглушка, возвращает id для элемента
//Будем надется что нигде не глюканет, потому что оригинальную фунцию из angular не получается потрировать 
function nextUid() {
    return "custom_id_" + new Date().getTime() + Math.random();
}

function hashKey(obj) {
    var objType = typeof obj, key;

    if ( objType === 'object' && obj !== null ) {
        if ( typeof (key = obj.$$hashKey) === 'function' ) {
            // must invoke on object to keep the right this
            key = obj.$$hashKey();
        } else if ( key === undefined ) {
            key = obj.$$hashKey = nextUid();
        }
    } else {
        key = obj;
    }

    return objType + ':' + key;
}

/**
 * A map where multiple values can be added to the same key such that they form a queue.
 * @returns {HashQueueMap}
 */
function HashQueueMap() {}
HashQueueMap.prototype = {
    /**
     * Same as array push, but using an array as the value for the hash
     */
    push: function (key, value) {
        var array = this[key = hashKey(key)];
        if ( !array ) {
            this[key] = [value];
        } else {
            array.push(value);
        }
    },

    /**
     * Same as array shift, but using an array as the value for the hash
     */
    shift: function (key) {
        var array = this[key = hashKey(key)];
        if ( array ) {
            if ( array.length === 1 ) {
                delete this[key];
                return array[0];
            } else {
                return array.shift();
            }
        }
    },

    /**
     * return the first item without deleting it
     */
    peek: function (key) {
        var array = this[hashKey(key)];
        if ( array ) {
            return array[0];
        }
    }
};

angular.module('TEST').directive('ngRepeatOrder', function () {
    return {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        compile: function (element, attr, linker) {
            return function (scope, iterStartElement, attr) {
                var expression = attr.ngRepeatOrder;

                //var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
                var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/), lhs, rhs, valueIdent, keyIdent;

                if ( !match ) {
                    throw Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" + expression + "'.");
                }
                lhs = match[1];
                rhs = match[2];
                match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
                if ( !match ) {
                    throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" + lhs + "'.");
                }
                valueIdent = match[3] || match[1];
                keyIdent = match[2];

                var tmp = rhs.split('by'), ord_l = tmp[1]; // order list

                rhs = tmp[0];

                // Store a list of elements from previous run. This is a hash where key is the item from the
                // iterator, and the value is an array of objects with following properties.
                //   - scope: bound scope
                //   - element: previous element.
                //   - index: position
                // We need an array of these objects since the same object can be returned from the iterator.
                // We expect this to be a rare case.
                var lastOrder = new HashQueueMap();

                scope.$watch(function ngRepeatWatch(scope) {
                    var index, length, collection = scope.$eval(rhs), order_list = scope.$eval(ord_l), cursor = iterStartElement,     // current position of the node
                    // Same as lastOrder but it has the current state. It will become the
                    // lastOrder on the next iteration.
                        nextOrder = new HashQueueMap(), arrayBound, childScope, key, value, // key/value of iteration
                        array, last;       // last object information {scope, element, index}

                    if (collection === undefined) { return; }

                    if ( !$.isArray(collection) ) {
                        // if object, extract keys, sort them and use to determine order of iteration over obj props
                        array = [];

                        if ( !order_list ) {
                            for ( key in collection ) {
                                if ( collection.hasOwnProperty(key) && key.charAt(0) !== '$' ) {
                                    array.push(key);
                                }
                            }
                            array.sort();
                        } else {
                            $.each(order_list, function (i, val) {
                                array.push(val);
                            });
                        }

                    } else {
                        array = collection || [];
                    }

                    arrayBound = array.length - 1;

                    // we are not using forEach for perf reasons (trying to avoid #call)
                    for ( index = 0, length = array.length; index < length; index++ ) {
                        key = (collection === array) ? index : array[index];
                        value = collection[key];

                        last = lastOrder.shift(value);

                        if ( last ) {
                            // if we have already seen this object, then we need to reuse the
                            // associated scope/element
                            childScope = last.scope;
                            nextOrder.push(value, last);

                            if ( index === last.index ) {
                                // do nothing
                                cursor = last.element;
                            } else {
                                // existing item which got moved
                                last.index = index;
                                // This may be a noop, if the element is next, but I don't know of a good way to
                                // figure this out,  since it would require extra DOM access, so let's just hope that
                                // the browsers realizes that it is noop, and treats it as such.
                                cursor.after(last.element);
                                cursor = last.element;
                            }
                        } else {
                            // new item which we don't know about
                            childScope = scope.$new();
                        }

                        childScope[valueIdent] = value;
                        if ( keyIdent ) { childScope[keyIdent] = key; }
                        childScope.$index = index;

                        childScope.$first = (index === 0);
                        childScope.$last = (index === arrayBound);
                        childScope.$middle = !(childScope.$first || childScope.$last);

                        if ( !last ) {
                            linker(childScope, function (clone) {
                                cursor.after(clone);
                                last = {
                                    scope: childScope,
                                    element: (cursor = clone),
                                    index: index
                                };
                                nextOrder.push(value, last);
                            });
                        }
                    }

                    //shrink children
                    for ( key in lastOrder ) {
                        if ( lastOrder.hasOwnProperty(key) ) {
                            array = lastOrder[key];
                            while ( array.length ) {
                                value = array.pop();
                                value.element.remove();
                                value.scope.$destroy();
                            }
                        }
                    }

                    lastOrder = nextOrder;
                });
            };
        }
    };
});
