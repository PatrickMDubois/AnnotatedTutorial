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
    "    <button ng-if=\"note.contributor==user.name\" ng-click=\"deleteIt(note.id)\" class=\"plain-button delete-button\">DELETE</button>\n" +
    "    <button class=\"rating-button\" ng-click=\"rateIt(note.id)\" tooltip=\"recommend\"></button>\n" +
    "    <div class=\"note-contributor\">Submitted by {{note.contributor}}</div>\n" +
    "    <div class=\"date\">{{date}}<br></div>\n" +
    "    <div ng-if=\"note.category === 'methods'\">Note relevant for: {{note.extra_info}}</div>\n" +
    "    <div ng-if=\"note.category === 'other'\">Note category: {{note.extra_info}}</div>\n" +
    "    <div class=\"note-content\">{{note.content}}</div>\n" +
    "    <div class=\"comment-footer\">\n" +
    "        <button class=\"plain-button reply-button\"\n" +
    "             ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\"\n" +
    "             ng-if=\"note.category === 'questions' && !baseline\">\n" +
    "                Add Answer\n" +
    "        </button>\n" +
    "        <button class=\"plain-button reply-button\"\n" +
    "            ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\"\n" +
    "            ng-if=\"baseline\">\n" +
    "                Reply\n" +
    "        </button>\n" +
    "        <button class=\"plain-button show-step-button\" ng-click=\"showList(note)\" ng-if=\"!general && !currentNote\">show steps</button>\n" +
    "        <button class=\"plain-button show-step-button\" ng-click=\"showList(note)\" ng-if=\"!general && currentNote\">hide steps</button>\n" +
    "        <div class=\"note-rating\">\n" +
    "            <div ng-if=\"note.rating>1\">{{note.rating}} people found this helpful.</div>\n" +
    "            <div ng-if=\"note.rating==1\">{{note.rating}} person found this helpful.</div>\n" +
    "            <div ng-if=\"note.rating<1\">Not rated yet.</div>\n" +
    "        </div>\n" +
    "        <div class=\"note-steps\">\n" +
    "            <div ng-if=\"notelist.length>=1 && !general\" ng-class=\"{'first-note-step':notelist.length>=2}\">Steps:{{notelist[0]}} </div>\n" +
    "            <div ng-if=\"notelist.length>=2\" ng-class=\"{'first-note-step':notelist.length>=3}\">, {{notelist[1]}}</div>\n" +
    "            <div ng-if=\"notelist.length>=3\" ng-class=\"{'first-note-step':notelist.length>3}\">, {{notelist[2]}}</div>\n" +
    "            <div ng-if=\"notelist.length>3\">+</div>\n" +
    "            <div ng-if=\"notelist.length<1 && !general\"> No Associated Step</div>\n" +
    "            <div ng-if=\"general\">General</div>\n" +
    "        </div>\n" +
    "        <note ng-repeat=\"reply in note.replies\" ng-if=\"note.replies.length > 0 && canShowNote(reply)\" note=\"reply\" delete-it = \"deleteIt\" rate-it = \"rateIt\" add-reply=\"addReply\" can-show-note=\"canShowNote\" baseline=\"baseline\" show-list=\"showList\" user=\"user\" general=\"general\" date=\"date\" current-note=\"currentNote\" notelist=\"noteList\"></note>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
})();
