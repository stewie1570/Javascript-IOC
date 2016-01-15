export class Ioc {

    constructor() {
        this.registeredDependencies = [];

        this.dependencyNameFrom = dependency => (this.first(
            this.registeredDependencies,
            binding => binding.construct == dependency) || { argName: null }).argName;

        this.hasRepeatsIn = array => this.any(
            array,
            element => this.count(array, e => e === element) > 1);

        this.createInjectedInstanceOf = ({constructor, constructedDependencies}) => {
            var args = [null].concat(constructedDependencies);
            var FactoryFunction = constructor.bind.apply(constructor, args);
            return new FactoryFunction();
        }

        this.toConstructedDependency = ({dependency, dependencyChain}) => {
            if (this.getDependenciesOf(dependency).length > 0)
                return this.get(dependency, dependencyChain);
            else
                return typeof (dependency) == "function" ? new dependency() : dependency;
        }

        this.toDependencyObject = (arg) => {
            var dependency = this.first(this.registeredDependencies, regDep => regDep.argName == arg);
            if (dependency == null)
                throw new Error(`Un-registered dependency '${arg}'.`);
            return dependency.construct || dependency.constant;
        }

        this.select = (arr, del) => {
            var ret = [];
            for (var i = 0; i < arr.length; i++) ret.push(del.call(this, arr[i]));
            return ret;
        }

        this.any = (arr, del) => {
            for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) return true;
            return false;
        }

        this.first = (arr, del) => {
            for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) return arr[i];
            return null;
        }

        this.count = (arr, del) => {
            var count = 0;
            for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) count++;
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

    bind(argName, obj) {
        if (typeof (obj) == "function")
            this.bindToConstructor(argName, obj);
        else
            this.bindToConstant(argName, obj);
    }

    bindToConstructor(argName, construct) {
        this.registeredDependencies.push({ argName: argName, construct: construct });
    }

    bindToConstant(argName, constant) {
        this.registeredDependencies.push({ argName: argName, constant: constant });
    }

    get(constructor, dependencyChain) {
        dependencyChain = dependencyChain || [this.dependencyNameFrom(constructor)];

        var dependencies = this.select(this.getDependenciesOf(constructor), this.toDependencyObject);

        if (this.hasRepeatsIn(dependencyChain))
            throw new Error(`Circular dependency detected: ${dependencyChain.join(' <- ') }.`);

        var constructedDependencies = this.select(
            dependencies,
            dependency => this.toConstructedDependency({
                dependency,
                dependencyChain: dependencyChain.concat(this.dependencyNameFrom(dependency))
            }));

        return this.createInjectedInstanceOf({ constructor, constructedDependencies });
    }
};