/// <reference path="jquery.d.ts" />
/// <reference path="semanticanalizer.ts" />

var App = (function () {
    function App() {
    }
    App.prototype.loadAnalizer = function (result) {
        this.analizer = new SemanticAnalizer.SemanticAnalizer(result).compile();
    };

    App.prototype.loadTypes = function (result) {
        this.types = result;
    };

    App.prototype.loadPreset = function (result) {
        if (!result) {
            this.insert();
            return;
        }
        for (var i in result)
            this.insert(result[i]);
    };

    App.prototype.insert = function (question) {
        if (typeof question === "undefined") { question = undefined; }
        var $root = $("<div>", { "class": "semantic" });
        $root.append($("<div>", { "html": "Question" })).append($("<div>", { "contenteditable": "true", "class": "edit question", "html": (!question ? "" : question.question) })).append($("<div>", { "html": "Answer" })).append($("<div>", { "contenteditable": "true", "class": "edit answer" })).append($("<div>", { "html": "Result" })).append($("<div>", { "class": "result" }));
        var $select = $("<select>");
        for (var i in this.types) {
            var option = $("<option>").val(this.types[i].ID).html(this.types[i].Name);
            $select.append(option);
            if (question && question.type == this.types[i].ID)
                option.attr("selected", "selected");
        }
        $root.append($("<div>").html("Type")).append($select);
        $("#content").append($root);
    };

    App.prototype.printSemantic = function (text, semanticWords) {
        for (var key in semanticWords) {
            var words = semanticWords[key];
            for (var i in words) {
                if (!new RegExp("(<b.*>)(" + words[i] + ")(<\/b>)", "gi").test(text))
                    text = text.replace(new RegExp(words[i], "gi"), "<b class='" + key + "'>" + words[i] + "</b>");
            }
        }
        return text;
    };

    App.prototype.analize = function () {
        var app = this;
        $(".semantic").each(function (i, a) {
            var quest = $(a).children(".question").first();
            var ans = $(a).children(".answer").first();
            if (!ans.text())
                return;
            var result = app.analizer.analize({
                answer: ans.text(),
                question: quest.text()
            });
            if (!result)
                return;
            ans.html(app.printSemantic(ans.html(), result));
            app.titleReassign();
            $(a).children(".result").first().html(app.count(result));
        });
    };

    App.prototype.count = function (sem) {
        var result = "";
        for (var i in sem)
            for (var j in this.types)
                if (this.types[j].ID == i)
                    result += this.types[j].Icon + ":" + sem[i].length + " ";
        return result;
    };

    App.prototype.titleReassign = function () {
        for (var i in this.types) {
            $("b." + this.types[i].ID).attr("title", this.types[i].Name);
        }
    };

    App.prototype.initFromWeb = function () {
        var app = this;
        $.getJSON("semantic.json", function (result) {
            app.loadAnalizer(result);
        });
        $.getJSON("type.json", function (result) {
            app.loadTypes(result);
            $.getJSON("preset.json", function (result) {
                app.loadPreset(result);
            });
        });
    };

    App.prototype.initLocal = function (data) {
        var app = this;
        app.loadAnalizer(data.semantic);
        app.loadTypes(data.types);
        app.loadPreset(data.preset);
    };

    App.prototype.start = function (start) {
        var app = this;
        $(start).click(function () {
            app.analize();
        });
    };

    App.prototype.addNew = function (addNew) {
        var app = this;
        $(addNew).click(function () {
            app.insert();
        });
    };
    return App;
})();
//# sourceMappingURL=app.js.map
