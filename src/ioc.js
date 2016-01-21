import { select, any, first, count, hasRepeatsIn } from './array-helpers';

export class Ioc {

    constructor() {
        this.registeredDependencies = [];

        this.dependencyNameFrom = dependency => (first({
            from: this.registeredDependencies,
            matching: binding => binding.construct == dependency
        }) || { dependencyName: this.getUnNamedDependencyStringFrom(dependency) }).dependencyName;

        this.createInjectedInstanceOf = ({constructor, dependencies}) => {
            var args = [null].concat(dependencies);
            var FactoryFunction = constructor.bind.apply(constructor, args);
            return new FactoryFunction();
        }

        this.toConstructedDependency = ({dependencyType, dependencyChain}) => {
            if (this.getDependenciesOf(dependencyType).length > 0)
                return this.get(dependencyType, dependencyChain);
            else
                return typeof (dependencyType) == "function" ? new dependencyType() : dependencyType;
        }

        this.toDependencyType = (dependencyName) => {
            var dependency = first({
                from: this.registeredDependencies,
                matching: regDep => regDep.dependencyName == dependencyName
            });
            if (dependency == null)
                throw new Error(`Un-registered dependency '${dependencyName}'.`);
            return dependency.construct || dependency.constant;
        }

        this.getDependenciesOf = construct => {
            var args = this.getArgNamesFrom(construct);
            return typeof (construct.prototype) === "undefined"
                || typeof (construct.prototype.dependencies) === "undefined"
                ? args
                : construct.prototype.dependencies;
        }

        this.getArgNamesFrom = construct => {
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

        this.getUnNamedDependencyStringFrom = construct => {
            var code = construct
                .toString()
                .replace(/\s/g, '');

            return code.substr(0, code.indexOf(")") + 1);
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

        if (hasRepeatsIn(dependencyChain))
            throw new Error(`Circular dependency detected in: ${dependencyChain.join(' <- ') }.`);

        var dependencyTypes = select({ from: this.getDependenciesOf(constructor), to: this.toDependencyType });

        return this.createInjectedInstanceOf(
            {
                constructor,
                dependencies: select({
                    from: dependencyTypes,
                    to: dependencyType => this.toConstructedDependency({
                        dependencyType,
                        dependencyChain: dependencyChain.concat(this.dependencyNameFrom(dependencyType))
                    })
                })
            });
    }
};