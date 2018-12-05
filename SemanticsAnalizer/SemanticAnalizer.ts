module SemanticAnalizer {
    export interface Type {
        ID: string;
        Name: string;
        Icon: string;
        logic_ethic: number;
        sensoric_intuition: number;
        version: number;
    }
    export class SemanticWords {
        [func: string]: string[];
    }
    export interface RootSemantic {
        roots: string[];
        excludes: string[];
    }
    class CompileRootSemantic {
        private roots: RegExp[];
        private excludes: RegExp[];

        static compile(rootSemantic: RootSemantic): CompileRootSemantic {
            var c = new CompileRootSemantic();
            c.roots = new Array<RegExp>(rootSemantic.roots.length);
            c.excludes = new Array<RegExp>(rootSemantic.excludes.length);
            for (var i in rootSemantic.roots)
                c.roots[i] = new RegExp(rootSemantic.roots[i],"gi");
            for (var i in rootSemantic.excludes)
                c.excludes[i] = new RegExp(rootSemantic.excludes[i], "gi");
            return c;
        }

        match(word: string): boolean {
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
        }
    }
    export interface SemanticGroup {
        rootGroups: RootSemantic[];
    }
    class CompileSemanticGroup {
        private rootGroups: CompileRootSemantic[];

        static compile(semantic: SemanticGroup): CompileSemanticGroup {
            var s = new CompileSemanticGroup();
            s.rootGroups = new Array<CompileRootSemantic>(semantic.rootGroups.length);

            for (var i in semantic.rootGroups) {
                s.rootGroups[i] = CompileRootSemantic.compile(semantic.rootGroups[i]);
            }
            return s;
        }

        match(word: string): boolean {
            for (var index in this.rootGroups)
                if (this.rootGroups[index].match(word))
                    return true;
            return false;
        }

        withoutQuestion(questions: string[]): CompileSemanticGroup {
            var s = new CompileSemanticGroup();
            s.rootGroups = new Array<CompileRootSemantic>();
            for (var i in this.rootGroups) {
                if (questions.every((e) => !this.rootGroups[i].match(e)))
                    s.rootGroups.push(this.rootGroups[i]);
            }
            return s;
        }
    }
    export interface Semantic {
        [func: string]: SemanticGroup;
    }
    class CompileSemantic {
        [func: string]: CompileSemanticGroup;

        static compile(semantic: Semantic): CompileSemantic {
            var s: CompileSemantic = {};
            for (var key in semantic) {
                s[key] = CompileSemanticGroup.compile(semantic[key]);
            }
            return s;
        }
    }

    export interface Data {
        question: string;
        answer: string;
    }

    export class SemanticAnalizer {

        private semantic: Semantic;
        private separators: RegExp;
        private compileSemantics: CompileSemantic;

        constructor(groups: Semantic) {
            this.semantic = groups;
            this.separators = /\s+|\?|,|\.|<([^<^>]*)>|\(|\)/gm;
        }

        compile(): SemanticAnalizer {
            this.compileSemantics = CompileSemantic.compile(this.semantic);
            return this;
        }

        analize(data: Data): SemanticWords {
            if (!this.compileSemantics)
                this.compile();

            var words: SemanticWords = {};

            var q = data.question.split(this.separators);
            var a = data.answer.split(this.separators);
            for (var key in this.compileSemantics) {
                var targetSemantic = this.compileSemantics[key].withoutQuestion(q);
                for (var i in a) { 
                    if (!a[i]) continue;
                    if (targetSemantic.match(a[i])) {
                        if (!words[key])
                            words[key] = [a[i]];
                        else
                            words[key].push(a[i]);
                    }
                }
            }
            return words;
        }
    }
}