(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("tutorial.html",
    "<div class=\"tutorial\" ng-repeat=\"element in tutorial\">\n" +
    "    <div class=\"content\">\n" +
    "        <div>{{element.text[0]}}</div>\n" +
    "        <div ng-mouseover=\"overImage=true\" ng-mouseleave=\"overImage=false\" class=\"image-container\">\n" +
    "            <img src=\"{{element.images[0]}}\" />\n" +
    "            <div class=\"image-tag\" ng-show=\"overImage\" ng-click=\"seeImages=true\">See {{element.images.length}} images.</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"notes\">\n" +
    "        <div ng-repeat=\"note in element.notes\">\n" +
    "            {{note}}\n" +
    "            <hr ng-if=\"!$last\" />\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"seeImages\">\n" +
    "        <img ng-repeat=\"image in element.images\" src=\"{{image}}\" />\n" +
    "    </div>\n" +
    "</div>");
}]);
})();
