(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note.html",
    "<div class=\"note\" ng-class=\"\n" +
    "    (note.category === 'corrections' ? 'note-corrections' :\n" +
    "    (note.category === 'methods'? 'note-methods' :\n" +
    "    (note.category === 'details' ? 'note-details' :\n" +
    "    (note.category === 'questions' ? 'note-questions' :\n" +
    "    (note.category === 'other' ? 'note-other' : 'reply-content')))))\">\n" +
    "\n" +
    "    <div class=\"note-steps\">\n" +
    "        <div ng-if=\"notelist.length>=1\" >Steps: {{notelist}}</div>\n" +
    "        <div ng-if=\"notelist.length<1\"> No Associated Step</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!baseline && note.category=='corrections'\">\n" +
    "        <div class=\"filter-icon filter-icon-corrections note-icon\" style=\"margin-top:5px\"></div>\n" +
    "        <div class=\"note-contributor\">Corrections•</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!baseline && note.category=='methods'\">\n" +
    "        <div class=\"filter-icon filter-icon-methods note-icon\" style=\"margin-top:5px\"></div>\n" +
    "        <div class=\"note-contributor\">What is this?•</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!baseline  && note.category=='details'\">\n" +
    "        <div class=\"filter-icon filter-icon-details note-icon\" style=\"margin-top:5px\"></div>\n" +
    "        <div class=\"note-contributor\">Tell Me More!•</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!baseline && note.category=='questions'\">\n" +
    "        <div class=\"filter-icon filter-icon-questions note-icon\" style=\"margin-top:5px\"></div>\n" +
    "        <div class=\"note-contributor\">Questions•</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!baseline && note.category=='other'\" style=\"margin-top:5px\">\n" +
    "        <div class=\"filter-icon filter-icon-other note-icon\" style=\"margin-top:5px\"></div>\n" +
    "        <div class=\"note-contributor\">Other•</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"note-contributor\">{{note.contributor}}•</div>\n" +
    "    <div class=\"date\">{{date}}</div>\n" +
    "\n" +
    "    <div class=\"note-content\" ng-if=\"note.category === 'methods'\">Note relevant for: {{note.extra_info}}</div>\n" +
    "    <div class=\"note-content\" ng-if=\"note.category === 'other'\">Note category: {{note.extra_info}}</div>\n" +
    "\n" +
    "    <div class=\"note-content\">{{note.content}}</div>\n" +
    "    <div class=\"comment-footer\">\n" +
    "        <button class=\"plain-button\"\n" +
    "             ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\"\n" +
    "             ng-if=\"note.category === 'questions' && !baseline\">\n" +
    "                ADD ANSWER\n" +
    "        </button>\n" +
    "\n" +
    "        <button ng-if=\"note.contributor==user.name\" ng-click=\"deleteIt(note.id)\" class=\"plain-button delete-button\">DELETE</button>\n" +
    "        <button class=\"rating-button\" ng-class=\"{'rated':note.contributor_list.indexOf(user.id)!=-1}\" ng-click=\"rateIt(note.id)\" tooltip=\"recommend\"></button>\n" +
    "        <div class=\"note-rating\">\n" +
    "            <div ng-if=\"note.contributor_list.length>1\">{{note.contributor_list.length}} people found this helpful.</div>\n" +
    "            <div ng-if=\"note.contributor_list.length==1\">{{note.contributor_list.length}} person found this helpful.</div>\n" +
    "            <div ng-if=\"note.contributor_list.length<1\">Not rated yet.</div>\n" +
    "    </div>\n" +
    "        <note ng-repeat=\"reply in note.replies\" ng-if=\"note.replies.length > 0 && canShowNote(reply)\" note=\"reply\" delete-it = \"deleteIt\" rate-it = \"rateIt\" add-reply=\"addReply\" can-show-note=\"canShowNote\" user=\"user\" date=\"date\" current-note=\"currentNote\" notelist=\"noteList\"></note>\n" +
    "    </div>\n" +
    "</div>");
}]);
})();
