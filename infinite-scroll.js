//infinite-scroll - {expression} - Expression to evaluate (usually a function call) when the bottom of the element approaches the bottom of the browser window.
//infinite-scroll-element - {class} - Class that denotes the DOM element to which to infinite scroll is triggered from.  
//infinite-scroll-distance (optional) - {number} - A number representing how close the bottom of the element must be to the bottom of the browser window before the expression specified by infinite-scroll is triggered.Measured in multiples of the infinite-scroll-element height
//infinite-scroll-disabled (optional) - {boolean} - A boolean expression that, when true, indicates that the infininite scroll expression should not be evaluated even if all other conditions are met. 
//infinite-scroll-immediate-check (optional) - {boolean} - A boolean expression that indicates that the directive should check immediately to see if a scroll event would trigger an evaluation of the infinite scroll expression even if a scroll event does not occur. 
angular.module('common')
    .directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
      return {
          link: function (scope, elem, attrs) {
              var scrollElement;
              if (attrs.infiniteScrollElement) {
                  scrollElement = angular.element('.' + attrs.infiniteScrollElement);
              } else {
                  scrollElement = angular.element($window);
              }             
              var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
              scrollDistance = 0;
              if (attrs.infiniteScrollDistance != null) {
                  scope.$watch(attrs.infiniteScrollDistance, function (value) {
                      return scrollDistance = parseInt(value, 10);
                  });
              }
              scrollEnabled = true;
              checkWhenEnabled = false;
              if (attrs.infiniteScrollDisabled != null) {
                  scope.$watch(attrs.infiniteScrollDisabled, function (value) {
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
                          return scope.$eval(attrs.infiniteScroll);
                      } else {
                          return scope.$apply(attrs.infiniteScroll);
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
                  if (attrs.infiniteScrollImmediateCheck) {
                      if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
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