(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note-filter.html",
    "<!--<ui-select ng-model=\"selectedItem\">\n" +
    "    <ui-select-match>\n" +
    "        <span ng-bind=\"$select.selected.name\"></span>\n" +
    "    </ui-select-match>\n" +
    "    <ui-select-choices repeat=\"item in (list | filter: $select.search) track by item.id\">\n" +
    "        <span ng-bind=\"item.name\"></span>\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>\n" +
    "       /*$scope.itemArray = [\n" +
    "            {id: 1, name: 'first'},\n" +
    "            {id: 2, name: 'second'},\n" +
    "            {id: 3, name: 'third'},\n" +
    "            {id: 4, name: 'fourth'},\n" +
    "            {id: 5, name: 'fifth'}\n" +
    "        ];\n" +
    "\n" +
    "        $scope.selectedItem = $scope.itemArray[0];\n" +
    "\n" +
    "        return {\n" +
    "            restrict: 'E',\n" +
    "            templateUrl: 'note-filter.html',\n" +
    "            scope: {list: '='}\n" +
    "        };\n" +
    "    });s\n" +
    "-->\n" +
    "");
}]);
})();

(function(module) {
try { module = angular.module("app-templates"); }
catch(err) { module = angular.module("app-templates", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("note.html",
    "<div class=\"note\" ng-class=\"{\n" +
    "     'note-corrections': note.category === 'corrections' ,\n" +
    "     'note-details': note.category === 'details',\n" +
    "     'note-questions': note.category === 'questions',\n" +
    "     'note-other': note.category === 'other',\n" +
    "     'reply-content': note.category === 'reply',\n" +
    "     'note-replies': note.replies.length>0,\n" +
    "     'replyOne' : replyOne,\n" +
    "     'replyTwo' : replyOne== false,\n" +
    "     'note-highlight': currentReply === note.id}\">\n" +
    "    <button class=\"plain-button show-step-button\" ng-click=\"showList(note)\" ng-if=\"!general && !currentNote && note.reply_to ==null && notelist.length>=1 \">show step(s)</button>\n" +
    "    <button class=\"plain-button show-step-button\" ng-click=\"showList(note)\" ng-if=\"!general && currentNote && note.reply_to ==null && notelist.length>=1 \">hide step(s)</button>\n" +
    "    <div class=\"note-steps text\">\n" +
    "        <div ng-if=\"notelist.length>=1 && !general\" >Steps: {{notelist}}</div>\n" +
    "        <div ng-if=\"notelist.length<1 && !general\"> No Associated Step</div>\n" +
    "        <div ng-if=\"general\">General</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"note.category=='corrections'\">\n" +
    "        <div class=\"filter-icon note-icon-corrections note-icon\" style=\"margin-top:5px; margin-right:5px;\"></div>\n" +
    "        <div class=\"note-contributor\">Corrections</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"note.category=='details'\">\n" +
    "        <div class=\"filter-icon note-icon-details note-icon\" style=\"margin-top:5px; margin-right:5px;\"></div>\n" +
    "        <div class=\"note-contributor\">Tell Me More!</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"note.category=='questions'\">\n" +
    "        <div class=\"filter-icon note-icon-questions note-icon\" style=\"margin-top:5px; margin-right:5px;\"></div>\n" +
    "        <div class=\"note-contributor\">Questions</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"note.category=='other'\">\n" +
    "        <div class=\"filter-icon note-icon-other note-icon\" style=\"margin-top:5px; margin-right:5px;\"></div>\n" +
    "        <div class=\"note-contributor\">Other</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"note-contributor\">{{note.contributor}}</div>\n" +
    "    <div class=\"date\">{{date}}<br></div>\n" +
    "    <div class=\"note-content\" ng-if=\"note.category === 'other'\">Note category: {{note.extra_info}}</div>\n" +
    "    <div class=\"note-content\">{{note.content}}</div>\n" +
    "    <div class=\"comment-footer\">\n" +
    "\n" +
    "        <button class=\"plain-button reply-button\"\n" +
    "             ng-click=\"addReply($index, $event, note.id, note.contributor, note.step_id)\">\n" +
    "                REPLY\n" +
    "        </button>\n" +
    "        <button ng-if=\"note.contributor==user.name\" ng-click=\"deleteIt(note.id)\" class=\"plain-button delete-button\">DELETE</button>\n" +
    "        <button class=\"rating-button\" ng-class=\"{'rated':note.contributor_list.indexOf(user.id)!=-1}\" ng-click=\"rateIt(note.id)\" tooltip=\"recommend\"></button>\n" +
    "        <div class=\"note-rating\">\n" +
    "            <div ng-if=\"note.contributor_list.length>1\">{{note.contributor_list.length}} people found this helpful.</div>\n" +
    "            <div ng-if=\"note.contributor_list.length==1\">{{note.contributor_list.length}} person found this helpful.</div>\n" +
    "            <div ng-if=\"note.contributor_list.length<1\">Not rated yet.</div>\n" +
    "        </div>\n" +
    "        <note ng-repeat=\"reply in note.replies\" ng-if=\"note.replies.length > 0 && canShowNote(reply)\" note=\"reply\" delete-it = \"deleteIt\" rate-it = \"rateIt\" add-reply=\"addReply\" can-show-note=\"canShowNote\" show-list=\"showList\" user=\"user\" general=\"general\" date=\"date\" current-note=\"currentNote\" notelist=\"noteList\" current-reply=\"currentReply\" reply-one=\"!replyOne\"></note>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
})();
