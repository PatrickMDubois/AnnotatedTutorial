angular.module('app-templates', ['templates/tutorial.html']);

angular.module("templates/tutorial.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/tutorial.html",
    "<div class=\"tutorial\" ng-repeat=\"element in tutorial\">\n" +
    "    <div class=\"content\">\n" +
    "        <div>{{element.text[0]}}</div>\n" +
    "        <img src=\"{{element.screenshots[0]}}\" />\n" +
    "    </div>\n" +
    "    <div class=\"notes\">\n" +
    "        <div ng-repeat=\"note in element.notes\">\n" +
    "            {{note}}\n" +
    "            <hr ng-if=\"!$last\" />\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);
