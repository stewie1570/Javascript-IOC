export class Ioc {

    constructor() {
        this.registeredDependencies = [];

        this.dependencyNameFrom = dependency => (this.first({
            from: this.registeredDependencies,
            matching: binding => binding.construct == dependency
        }) || { dependencyName: null }).dependencyName;

        this.hasRepeatsIn = array => this.any({
            from: array,
            matching: outer => this.count({ from: array, matching: inner => inner === outer }) > 1
        });

        this.createInjectedInstanceOf = ({constructor, dependencies}) => {
            var args = [null].concat(dependencies);
            var FactoryFunction = constructor.bind.apply(constructor, args);
            return new FactoryFunction();
        }

        this.toConstructedDependency = ({dependency, dependencyChain}) => {
            if (this.getDependenciesOf(dependency).length > 0)
                return this.get(dependency, dependencyChain);
            else
                return typeof (dependency) == "function" ? new dependency() : dependency;
        }

        this.toDependencyObject = (dependencyName) => {
            var dependency = this.first({
                from: this.registeredDependencies,
                matching: regDep => regDep.dependencyName == dependencyName
            });
            if (dependency == null)
                throw new Error(`Un-registered dependency '${dependencyName}'.`);
            return dependency.construct || dependency.constant;
        }

        this.select = ({from, to}) => {
            var ret = [];
            for (var i = 0; i < from.length; i++) ret.push(to.call(this, from[i]));
            return ret;
        }

        this.any = ({from, matching}) => {
            for (var i = 0; i < from.length; i++) if (matching.call(this, from[i])) return true;
            return false;
        }

        this.first = ({from, matching}) => {
            for (var i = 0; i < from.length; i++) if (matching.call(this, from[i])) return from[i];
            return null;
        }

        this.count = ({from, matching}) => {
            var count = 0;
            for (var i = 0; i < from.length; i++) if (matching.call(this, from[i])) count++;
            return count;
        }

        this.getDependenciesOf = construct => {
            var args = this.getArgNames(construct);
            return typeof (construct.prototype) === "undefined"
                || typeof (construct.prototype.dependencies) === "undefined"
                ? args
                : construct.prototype.dependencies;
        }

        this.getArgNames = construct => {
            var code = construct
                .toString()
                .replace(/\s/g, '');
            var start = code.indexOf("(") + 1;
            var end = code.indexOf(")");

            if (start < 0 || end < 0 || end - start < 1)
                return [];
            else {
                return code
                    .substring(start, end)
                    .split(",");
            }
        }
    }

    bind(dependencyName, obj) {
        if (typeof (obj) == "function")
            this.bindToConstructor(dependencyName, obj);
        else
            this.bindToConstant(dependencyName, obj);
    }

    bindToConstructor(dependencyName, construct) {
        this.registeredDependencies.push({ dependencyName, construct: construct });
    }

    bindToConstant(dependencyName, constant) {
        this.registeredDependencies.push({ dependencyName, constant: constant });
    }

    get(constructor, dependencyChain) {
        dependencyChain = dependencyChain || [this.dependencyNameFrom(constructor)];

        var dependencies = this.select({ from: this.getDependenciesOf(constructor), to: this.toDependencyObject });

        if (this.hasRepeatsIn(dependencyChain))
            throw new Error(`Circular dependency detected: ${dependencyChain.join(' <- ') }.`);

        var toConstructedDependencies = this.select({
            from: dependencies,
            to: dependency => this.toConstructedDependency({
                dependency,
                dependencyChain: dependencyChain.concat(this.dependencyNameFrom(dependency))
            })
        });

        return this.createInjectedInstanceOf({ constructor, dependencies: toConstructedDependencies });
    }
};