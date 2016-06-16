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
    "    (note.category === 'questions' ? 'note-questions' :\n" +
    "    (note.category === 'other' ? 'note-other' : ''))))\">\n" +
    "\n" +
    "    <div ng-if=\"note.category === 'methods'\">Note relevant for: {{note.extra_info}}</div>\n" +
    "    <div ng-if=\"note.category === 'other'\">Note category: {{note.extra_info}}</div>\n" +
    "    <div>{{note.content}}</div>\n" +
    "    <div class=\"comment-footer\">\n" +
    "        <button class=\"plain-button reply-button\"\n" +
    "             ng-click=\"addReply($index, $event, note.id, note.author, note.step_id)\"\n" +
    "             ng-if=\"note.category === 'questions'\">\n" +
    "                Post Answer\n" +
    "        </button>\n" +
    "        <div class=\"note-author\">Submitted by {{note.author}}</div>\n" +
    "        <note ng-if=\"note.replies.length > 0\" ng-repeat=\"reply in note.replies\" note=\"reply\" add-reply=\"addReply\"></note>\n" +
    "    </div>\n" +
    "</div>");
}]);
})();
