//qt-infinite-scroll - {expression} - Expression to evaluate (usually a function call) when the bottom of the element approaches the bottom of the browser window.
//qt-infinite-scroll-element - {class} - Class that denotes the DOM element to which to infinite scroll is triggered from.  
//qt-infinite-scroll-distance (optional) - {number} - A number representing how close the bottom of the element must be to the bottom of the browser window before the expression specified by infinite-scroll is triggered.Measured in multiples of the qt-infinite-scroll-element height
//qt-infinite-scroll-disabled (optional) - {boolean} - A boolean expression that, when true, indicates that the infininite scroll expression should not be evaluated even if all other conditions are met. 
//qt-infinite-scroll-immediate-check (optional) - {boolean} - A boolean expression that indicates that the directive should check immediately to see if a scroll event would trigger an evaluation of the infinite scroll expression even if a scroll event does not occur. 
angular.module('common')
    .directive('qtInfiniteScroll', [
  '$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
      return {
          link: function (scope, elem, attrs) {
              var scrollElement;
              if (attrs.qtInfiniteScrollElement) {
                  scrollElement = angular.element('.' + attrs.qtInfiniteScrollElement);
              } else {
                  scrollElement = angular.element($window);
              }             
              var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
              scrollDistance = 0;
              if (attrs.qtInfiniteScrollDistance != null) {
                  scope.$watch(attrs.qtInfiniteScrollDistance, function (value) {
                      return scrollDistance = parseInt(value, 10);
                  });
              }
              scrollEnabled = true;
              checkWhenEnabled = false;
              if (attrs.qtInfiniteScrollDisabled != null) {
                  scope.$watch(attrs.qtInfiniteScrollDisabled, function (value) {
                      scrollEnabled = !value;
                      if (scrollEnabled && checkWhenEnabled) {
                          checkWhenEnabled = false;
                          return handler();
                      }
                  });
              }
              handler = function () {
                  
                  var elementBottom, remaining, shouldScroll, windowBottom;
                  
                  windowBottom = scrollElement.height() + scrollElement.scrollTop();
                  elementBottom = elem.offset().top + elem.height();
                  remaining = elementBottom - windowBottom;
                  shouldScroll = remaining <= scrollElement.height() * scrollDistance;
                  if (shouldScroll && scrollEnabled) {
                      if ($rootScope.$$phase) {
                          return scope.$eval(attrs.qtInfiniteScroll);
                      } else {
                          return scope.$apply(attrs.qtInfiniteScroll);
                      }
                  } else if (shouldScroll) {
                      return checkWhenEnabled = true;
                  }
              };
              scrollElement.on('scroll', handler);

              scope.$on('$destroy', function () {
                  return scrollElement.off('scroll', handler);
              });
              return $timeout((function () {
                  if (attrs.qtInfiniteScrollImmediateCheck) {
                      if (scope.$eval(attrs.qtInfiniteScrollImmediateCheck)) {
                          return handler();
                      }
                  } else {
                      return handler();
                  }
              }), 0);
          }
      };
  }
]);