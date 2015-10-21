var SemanticAnalizer;
(function (_SemanticAnalizer) {
    var SemanticWords = (function () {
        function SemanticWords() {
        }
        return SemanticWords;
    })();
    _SemanticAnalizer.SemanticWords = SemanticWords;

    var CompileRootSemantic = (function () {
        function CompileRootSemantic() {
        }
        CompileRootSemantic.compile = function (rootSemantic) {
            var c = new CompileRootSemantic();
            c.roots = new Array(rootSemantic.roots.length);
            c.excludes = new Array(rootSemantic.excludes.length);
            for (var i in rootSemantic.roots)
                c.roots[i] = new RegExp(rootSemantic.roots[i], "gi");
            for (var i in rootSemantic.excludes)
                c.excludes[i] = new RegExp(rootSemantic.excludes[i], "gi");
            return c;
        };

        CompileRootSemantic.prototype.match = function (word) {
            var ret = false;
            for (var i in this.roots) {
                if (this.roots[i].test(word)) {
                    for (var j in this.excludes) {
                        if (this.excludes[j].test(word))
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
            s.rootGroups = new Array(semantic.rootGroups.length);

            for (var i in semantic.rootGroups) {
                s.rootGroups[i] = CompileRootSemantic.compile(semantic.rootGroups[i]);
            }
            return s;
        };

        CompileSemanticGroup.prototype.match = function (word) {
            for (var index in this.rootGroups)
                if (this.rootGroups[index].match(word))
                    return true;
            return false;
        };

        CompileSemanticGroup.prototype.withoutQuestion = function (questions) {
            var _this = this;
            var s = new CompileSemanticGroup();
            s.rootGroups = new Array();
            for (var i in this.rootGroups) {
                if (questions.every(function (e) {
                    return !_this.rootGroups[i].match(e);
                }))
                    s.rootGroups.push(this.rootGroups[i]);
            }
            return s;
        };
        return CompileSemanticGroup;
    })();

    var CompileSemantic = (function () {
        function CompileSemantic() {
        }
        CompileSemantic.compile = function (semantic) {
            var s = {};
            for (var key in semantic) {
                s[key] = CompileSemanticGroup.compile(semantic[key]);
            }
            return s;
        };
        return CompileSemantic;
    })();

    var SemanticAnalizer = (function () {
        function SemanticAnalizer(groups) {
            this.semantic = groups;
            this.separators = /\s+|\?|,|\.|<([^<^>]*)>/gm;
        }
        SemanticAnalizer.prototype.compile = function () {
            this.compileSemantics = CompileSemantic.compile(this.semantic);
            return this;
        };

        SemanticAnalizer.prototype.analize = function (data) {
            if (!this.compileSemantics)
                this.compile();

            var words = {};

            var q = data.question.split(this.separators);
            var a = data.answer.split(this.separators);
            for (var key in this.compileSemantics) {
                var targetSemantic = this.compileSemantics[key].withoutQuestion(q);
                for (var i in a) {
                    if (!a[i])
                        continue;
                    if (targetSemantic.match(a[i])) {
                        if (!words[key])
                            words[key] = [a[i]];
                        else
                            words[key].push(a[i]);
                    }
                }
            }
            return words;
        };
        return SemanticAnalizer;
    })();
    _SemanticAnalizer.SemanticAnalizer = SemanticAnalizer;
})(SemanticAnalizer || (SemanticAnalizer = {}));
//# sourceMappingURL=SemanticAnalizer.js.map
