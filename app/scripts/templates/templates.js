(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note.html",
    "<div class=\"note\" ng-class=\"\n" +
    "    note.category === 'corrections' ? 'note-corrections' :\n" +
    "    (note.category === 'methods' ? 'note-methods' :\n" +
    "    (note.category === 'details' ? 'note-details' :\n" +
    "    (note.category === 'other' ? 'note-other' : '')))\">\n" +
    "\n" +
    "    <div ng-if=\"note.category === 'methods'\">Note relevant for: {{note.extra_info}}</div>\n" +
    "    <div ng-if=\"note.category === 'other'\">Note category: {{note.extra_info}}</div>\n" +
    "    <div>{{note.content}}</div>\n" +
    "    <div class=\"comment-footer\">\n" +
    "        <div class=\"plain-button reply-button\"\n" +
    "             ng-click=\"addingReply($index, $event, note.id, note.author, note.step_id)\"\n" +
    "             ng-if=\"note.category === 'other' && (note.extra_info|lowercase) === 'question'\">\n" +
    "                Post Answer\n" +
    "        </div>\n" +
    "        <div class=\"note-author\">Submitted by {{note.author}}</div>\n" +
    "        <div ng-if=\"note.replies.length > 0\">Has replies.</div>\n" +
    "    </div>\n" +
    "</div>");
}]);
})();
