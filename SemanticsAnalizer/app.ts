/// <reference path="jquery.d.ts" />
/// <reference path="semanticanalizer.ts" />
interface Question {
    question: string;
    type: string;
}

interface Data {
    types: SemanticAnalizer.Type[];
    semantic: SemanticAnalizer.Semantic;
    preset: Question[];
}

class App {
    private analizer: SemanticAnalizer.SemanticAnalizer;
    private types: SemanticAnalizer.Type[];

    loadAnalizer(result: SemanticAnalizer.Semantic) {
        this.analizer = new SemanticAnalizer.SemanticAnalizer(result).compile();
    }

    loadTypes(result: SemanticAnalizer.Type[]) {
        this.types = result;
    }

    loadPreset(result: Question[]) {
        if (!result) {
            this.insert();
            return;
        }
        for (var i in result) this.insert(result[i]);
    }

    private insert(question: Question = undefined) {
        var $root = $("<div>", { "class": "semantic", "id": "num" + $(".semantic").length });
        $root.append($("<a href='#'>X</a>").addClass("close"));
        $root.append($("<div>", { "html": "Question" }))
            .append($("<div>", { "contenteditable": "true", "class": "edit question", "html": (!question ? "" : question.question) }))
            .append($("<div>", { "html": "Answer" }))
            .append($("<div>", { "contenteditable": "true", "class": "edit answer" }))
            .append($("<div>", { "html": "Result" }))
            .append($("<div>", { "class": "result" }));
        var $select = $("<select>");
        for (var i in this.types) {
            var option = $("<option>").val(this.types[i].ID).html(this.types[i].Name);
            $select.append(option);
            if (question && question.type == this.types[i].ID)
                option.attr("selected", "selected");
        }
        $root.append($("<div>").html("Type")).append($select);
        
        var app = this;
        $("a.close").click((e) => app.remove(e));
        $("#content").append($root);
    }

    private remove(e: JQueryEventObject) {
        e.stopPropagation();
        $(e.target).parent().empty();
        $(".semantic:empty").remove();
    }

    private printSemantic(text: string, semanticWords: SemanticAnalizer.SemanticWords): string {
        for (var key in semanticWords) {
            var words = semanticWords[key];
            for (var i in words) {
                if (!new RegExp("(<b.*>)(" + words[i] + ")(<\/b>)", "gi").test(text))
                    text = text.replace(new RegExp(words[i], "gi"), "<b class='" + key + "'>" + words[i] + "</b>");
            }
        }
        return text;
    }

    private analize() {
        var app = this;
        $(".semantic").each((i,a) => {
            var quest = $(a).children(".question").first();
            var ans = $(a).children(".answer").first();
            if (!ans.text()) return;
            var result = app.analizer.analize({
                answer: ans.text(),
                question: quest.text()
            });
            if (!result) return;
            ans.html(app.printSemantic(ans.html(), result));
            app.titleReassign();
            $(a).children(".result").first().html(app.count(result));
        });
    }

    private count(sem: SemanticAnalizer.SemanticWords): string {
        var result = "";
        for (var i in sem)
            for (var j in this.types)
                if (this.types[j].ID == i)
                    result += this.types[j].Icon + ":" + sem[i].length+" ";
        return result;
    }

    private titleReassign() {
        for (var i in this.types) {
            $("b." + this.types[i].ID).attr("title", this.types[i].Name);
        }
    }

    initFromWeb() {
        var app = this;
        $.getJSON("semantic.json", (result: SemanticAnalizer.Semantic) => {
            app.loadAnalizer(result);
        });
        $.getJSON("type.json", (result: SemanticAnalizer.Type[]) => {
            app.loadTypes(result);
            $.getJSON("preset.json", (result: Question[]) => {
                app.loadPreset(result);
            });
        });
    }

    initLocal(data: Data) {
        var app = this;
        app.loadAnalizer(data.semantic);
        app.loadTypes(data.types);
        app.loadPreset(data.preset);
    }

    start(start: string) {
        var app = this;
        $(start).click(function () { app.analize(); });
    }

    addNew(addNew: string) {
        var app = this;
        $(addNew).click(function () { app.insert(); });
    }
}