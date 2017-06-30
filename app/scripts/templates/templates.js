(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note.html",
    "<div class=\"note\">\n" +
    "    <div class=\"note-contributor\">Submitted by {{note.contributor}}•</div>\n" +
    "    <div class=\"date\">{{date}}<br></div>\n" +
    "    <div class=\"note-content\">{{note.content}}</div>\n" +
    "\n" +
    "    <div class=\"comment-footer\">\n" +
    "        <button class=\"plain-button reply-button\" ng-if=\"currentReply !== note.id\" ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\">Reply</button>\n" +
    "        <button class=\"plain-button reply-button\" ng-if=\"currentReply === note.id\" ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\">Cancel</button>\n" +
    "        <button ng-if=\"note.contributor==user.name\" ng-click=\"deleteIt(note.id)\" class=\"plain-button delete-button\">DELETE</button>\n" +
    "        <button class=\"rating-button\" ng-click=\"rateIt(note.id)\" tooltip=\"recommend\"></button>\n" +
    "        <div class=\"note-rating\">\n" +
    "            <div ng-if=\"note.rating>1\">{{note.rating}} people found this helpful. {{currentReply}} {{currentReply === note.id}}</div>\n" +
    "            <div ng-if=\"note.rating==1\">{{note.rating}} person found this helpful.</div>\n" +
    "            <div ng-if=\"note.rating<1\">Not rated yet.</div>\n" +
    "        </div>\n" +
    "        <note ng-repeat=\"reply in note.replies\" ng-if=\"note.replies.length > 0 && canShowNote(reply)\" note=\"reply\" delete-it = \"deleteIt\" rate-it = \"rateIt\" add-reply=\"addReply\" can-show-note=\"canShowNote\" user=\"user\" date=\"date\" current-reply=\"currentReply\"></note>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
})();
