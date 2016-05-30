(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note.html",
    "<div>Note category: {{note.extra_info}}</div>\n" +
    "<div>{{note.content}}</div>\n" +
    "<div class=\"comment-footer\">\n" +
    "    <div class=\"plain-button reply-button\" ng-click=\"addingReply($index, $event, note.id, note.author, note.step_id)\" ng-if=\"(note.extra_info|lowercase) === 'question'\">Post Answer</div>\n" +
    "    <div class=\"note-author\">Submitted by {{note.author}}</div>\n" +
    "</div>");
}]);
})();
