var CompileRootSemantic = (function () {
    function CompileRootSemantic() {
    }
    CompileRootSemantic.compile = function (rootSemantic) {
        var c = new CompileRootSemantic();
        c.roots = new Array(rootSemantic.roots.length);
        c.excludes = new Array(rootSemantic.excludes.length);
        for (var i in rootSemantic.roots)
            c.roots[i] = new RegExp(rootSemantic.roots[i]).compile();
        for (var i in rootSemantic.excludes)
            c.excludes[i] = new RegExp(rootSemantic.excludes[i]).compile();
        return c;
    };

    CompileRootSemantic.prototype.match = function (word) {
        var ret = false;
        for (var i in this.roots) {
            if (this.roots[i].test(word)) {
                for (var j in this.excludes) {
                    if (this.excludes[i].test(word))
                        return false;
                }
                ret = ret || true;
            }
        }
        return ret;
    };
    return CompileRootSemantic;
})();

var CompileSemanticGroup = (function () {
    function CompileSemanticGroup() {
    }
    CompileSemanticGroup.compile = function (semantic) {
        var s = new CompileSemanticGroup();
        s.rootGroups = new Array();
        for (var i in semantic.rootGroups) {
            s.rootGroups.push(CompileRootSemantic.compile(semantic.rootGroups[i]));
        }
        return s;
    };

    CompileSemanticGroup.prototype.match = function (word) {
        for (var index in this.rootGroups)
            if (this.rootGroups[index].match(word))
                return true;
        return false;
    };
    return CompileSemanticGroup;
})();
var Semantic = (function () {
    function Semantic() {
    }
    return Semantic;
})();
var CompileSemantic = (function () {
    function CompileSemantic() {
    }
    return CompileSemantic;
})();
var SemanticAnalizer = (function () {
    function SemanticAnalizer(groups) {
        this.semantics = groups;
        this.separators = /\S+\s*/g;
    }
    SemanticAnalizer.prototype.compile = function () {
        this.compileSemantics = new Array(this.semantics.length);
        for (var i in this.semantics)
            this.compileSemantics[i] = CompileSemanticGroup.compile(this.semantics[i]);
        return this;
    };

    SemanticAnalizer.prototype.analize = function (i, text, question) {
        if (!this.compileSemantics)
            this.compile();
        var array = new Array();

        var q = question.split(this.separators);
        var a = text.split(this.separators);
        for (var i in q) {
        }
        return array;
    };
    return SemanticAnalizer;
})();
//# sourceMappingURL=analizer.js.map
