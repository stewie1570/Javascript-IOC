import { select, any, first, count, hasRepeatsIn } from './array-helpers';

export class Ioc {

    constructor() {
        this._registeredDependencies = [];
    }

    bind(dependencyName, obj) {
        if (typeof (obj) == "function")
            this.bindToConstructor(dependencyName, obj);
        else
            this.bindToConstant(dependencyName, obj);
    }

    bindToConstructor(dependencyName, construct) {
        this._registeredDependencies.push({ dependencyName, construct: construct });
    }

    bindToConstant(dependencyName, constant) {
        this._registeredDependencies.push({ dependencyName, constant: constant });
    }

    get(constructor, dependencyChain) {
        dependencyChain = dependencyChain || [this._dependencyNameFrom(constructor)];

        if (hasRepeatsIn(dependencyChain))
            throw new Error(`Circular dependency detected in: ${dependencyChain.join(' <- ') }.`);

        var dependencyTypes = select({
            from: this._getDependenciesOf(constructor),
            to: dependency => this._toDependencyType(dependency)
        });

        return this._createInjectedInstanceOf(
            {
                constructor,
                dependencies: select({
                    from: dependencyTypes,
                    to: dependencyType => this._toConstructedDependency({
                        dependencyType,
                        dependencyChain: dependencyChain.concat(this._dependencyNameFrom(dependencyType))
                    })
                })
            });
    }

    _toDependencyType(dependencyName) {
        var dependency = first({
            from: this._registeredDependencies,
            matching: regDep => regDep.dependencyName === dependencyName
        });

        if (dependency == null)
            throw new Error(`Un-registered dependency '${dependencyName}'.`);

        return dependency.construct || dependency.constant;
    }

    _getUnNamedDependencyStringFrom(construct) {
        var code = construct
            .toString()
            .replace(/\s/g, '');

        return code.substr(0, code.indexOf(")") + 1);
    }

    _getArgNamesFrom(construct) {
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

    _getDependenciesOf(construct) {
        var args = this._getArgNamesFrom(construct);
        return typeof (construct.prototype) === "undefined"
            || typeof (construct.prototype.dependencies) === "undefined"
            ? args
            : construct.prototype.dependencies;
    }

    _toConstructedDependency({dependencyType, dependencyChain}) {
        if (this._getDependenciesOf(dependencyType).length > 0)
            return this.get(dependencyType, dependencyChain);
        else
            return typeof (dependencyType) == "function" ? new dependencyType() : dependencyType;
    }

    _dependencyNameFrom(dependency) {
        return (first({
            from: this._registeredDependencies,
            matching: binding => binding.construct == dependency
        }) || { dependencyName: this._getUnNamedDependencyStringFrom(dependency) }).dependencyName;
    }

    _createInjectedInstanceOf({constructor, dependencies}) {
        var args = [null].concat(dependencies);
        var FactoryFunction = constructor.bind.apply(constructor, args);
        return new FactoryFunction();
    }
};