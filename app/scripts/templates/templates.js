(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note.html",
    "<div class=\"note\" ng-class=\"\n" +
    "    (note.category === 'corrections' && !baseline ? 'note-corrections' :\n" +
    "    (note.category === 'methods' && !baseline ? 'note-methods' :\n" +
    "    (note.category === 'details' && !baseline ? 'note-details' :\n" +
    "    (note.category === 'questions' && !baseline ? 'note-questions' :\n" +
    "    (note.category === 'other' && !baseline ? 'note-other' : 'baseline-content')))))\">\n" +
    "    <div ng-if=\"note.category === 'methods'\">Note relevant for: {{note.extra_info}}</div>\n" +
    "    <div ng-if=\"note.category === 'other'\">Note category: {{note.extra_info}}</div>\n" +
    "    <div>{{note.content}}</div>\n" +
    "    <div class=\"comment-footer\">\n" +
    "        <button class=\"plain-button reply-button\"\n" +
    "             ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\"\n" +
    "             ng-if=\"note.category === 'questions' && !baseline\">\n" +
    "                Post Answer\n" +
    "        </button>\n" +
    "        <button class=\"plain-button reply-button\"\n" +
    "            ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\"\n" +
    "            ng-if=\"baseline\">\n" +
    "                Reply\n" +
    "        </button>\n" +
    "        <button ng-click=\"deleteIt(note.id)\" class=\"plain-button delete-button\">Delete</button>\n" +
    "        <div class=\"note-contributor\">Submitted by {{note.contributor}}</div>\n" +
    "        <div class=\"note-rating\">{{note.rating}} people found this note helpful.</div>\n" +
    "        <button ng-click=\"rateIt(note.id)\" class=\"rating-button\">^</button>\n" +
    "        <!--<div class=\"date\">Submitted {{note.dateSubmitted}}</div>-->\n" +
    "        <note ng-repeat=\"reply in note.replies\" ng-if=\"note.replies.length > 0 && canShowNote(reply)\" note=\"reply\" delete-it = \"deleteIt\" rate-it = \"rateIt\" add-reply=\"addReply\" can-show-note=\"canShowNote\" baseline=\"baseline\"></note>\n" +
    "    </div>\n" +
    "</div>");
}]);
})();
