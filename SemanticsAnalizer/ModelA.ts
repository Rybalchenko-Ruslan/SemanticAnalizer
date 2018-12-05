module SemanticAnalizer {

    export interface ModelData {
        func: Type
        semantic: SemanticWords
    }
    export interface ModelCount {
        [model:string]:number
    }
    export interface ModelACount {
        a: ModelA
        count: number
    }

    export class ModelAHelper {
        private types: Type[]

        constructor(types: Type[]) {
            this.types = types
        }

        integral(all: ModelA[]) {
            if (all.length < 2) return all[0]
            var logic_ethic = 0
            var sensoric_intuition = 0
            var version = 0
            var rationality = 0
            for (var i in all) {
                logic_ethic += all[i].primaryType.logic_ethic
                logic_ethic += all[i].secondaryType.logic_ethic
                sensoric_intuition += all[i].primaryType.sensoric_intuition
                sensoric_intuition += all[i].secondaryType.sensoric_intuition
                version += all[i].primaryType.version
                if (all[i].primaryType.logic_ethic != 0)
                    rationality++;
                else rationality--;
            }
            if (logic_ethic == 0 || sensoric_intuition == 0)
                return null
            var logic = 0
            if (logic_ethic > 0) logic = 1; else logic = -1;
            var sensoric = 0
            if (sensoric_intuition > 0) sensoric = 1; else sensoric = -1;
            var ver = 0
            if (version > 0) ver = 1; else ver = -1;

            var rationalType = this.types.filter(r => r.logic_ethic == logic && r.version == ver)[0]
            var irrationalType = this.types.filter(r => r.sensoric_intuition == sensoric && r.version != ver)[0]

            if (rationality > 0)
                return new ModelA(rationalType, irrationalType)
            else
                return new ModelA(irrationalType, rationalType)
        }

        /**
         * Return invertion by dihotomy
         * @param primary
         */
        getInverties(primary: Type) {
            if (primary.logic_ethic != 0)
                return this.types.filter(p => p.logic_ethic == 0 && p.version == -primary.version)
            else
                return this.types.filter(p => p.sensoric_intuition == 0 && p.version == -primary.version)
        }

        getSecondary(primary: Type, fear: Type) {
            return this.getInverties(primary).filter(s => s.ID != fear.ID)[0]
        }

        getFear(primary: Type, secondary: Type) {
            return this.getInverties(primary).filter(s => s.ID != secondary.ID)[0]
        }

        byFear(fear: Type) {
            var primaries = this.getInverties(fear)
            return primaries.map(p => new ModelA(p, this.getSecondary(p, fear)))
        }

        byPrimary(primary: Type) {
            var secondaries = this.getInverties(primary)
            return secondaries.map(s => new ModelA(primary, s))
        }

        bySecondary(secondary: Type) {
            var primaries = this.getInverties(secondary)
            return primaries.map(p => new ModelA(p, secondary))
        }

        byQuestion(question: Type, answers: Type[]) {
            if (answers.some(a => a.ID == question.ID))
                return this.byPrimary(question).concat(this.bySecondary(question))
            var secondaries = this.getInverties(question)
            for (var i in secondaries)
                if (answers.some(a => a.ID == question.ID) && answers.some(a => a.ID == secondaries[i].ID))
                    return this.byPrimary(question).concat(this.bySecondary(secondaries[i]))
            var fears = this.getInverties(question)
            for (var i in fears)
                if (answers.some(a => fears[i].ID == a.ID))
                    return this.byFear(fears[i])
            var answeredTypes = new Array<ModelA>()
            for (var i in answers)
                answeredTypes = answeredTypes.concat(this.byPrimary(answers[i])).concat(this.bySecondary(answers[i]))
            return answeredTypes.filter(m => m.primaryType.ID != question.ID && m.secondaryType.ID != question.ID)
        }

        createModelList() {
            var models = new Array<ModelA>()
            this.types.forEach(primary => models = models.concat(this.byPrimary(primary)))
            return models
        }

        createModels(datas: Array<ModelData>): ModelA[] {
            var models = Array<ModelA>()
            datas.forEach(data => {
                var answers = new Array<Type>()
                for (var key in data.semantic)
                    for (var i in data.semantic[key])
                        answers = answers.concat(this.types.filter(t => t.ID == key))
                models = models.concat(this.byQuestion(data.func, answers))
            })
            return models
        }

        createHypothesis(datas: Array<ModelData>): ModelACount[] {
            var hipothesis: ModelCount = {}
            var list = this.createModelList()
            list.forEach(k => hipothesis[k.getKey()] = 0)
            var one = this.createModels(datas)
            console.log(this.integral(one))
            for (var key in hipothesis)
                hipothesis[key] = one.filter(m => m.getKey() == key).length

            return list.map(model => {
                var key = model.getKey()
                return {
                    a: model,
                    count: hipothesis[key]
                }
            })
        }
    }
    class ModelA {
        primaryType: Type
        secondaryType: Type

        constructor(primary: Type, secondary: Type) {
            this.primaryType = primary
            this.secondaryType = secondary
        }

        getKey() {
            return this.primaryType.ID + "_" + this.secondaryType.ID
        }
    }
}