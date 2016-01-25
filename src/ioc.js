import { select, first, count } from './array-helpers';

export class Ioc {

    constructor() {
        this._registeredDependencies = [];
    }

    bind(dependencyName, bind) {
        if(bind.toConstructor)
            this._registeredDependencies.push({ dependencyName, construct: bind.toConstructor });
        else if(bind.toConstant)
            this._registeredDependencies.push({ dependencyName, constant: bind.toConstant });
        else if(bind.to)
        {
            var binding = { dependencyName };
            binding[typeof (bind.to) == 'function' ? 'construct' : 'constant'] = bind.to;
            this._registeredDependencies.push(binding);
        }
        else
            throw new Error(`Unable to bind "${dependencyName}". Binding must contain a to, toConstructor or toConstant value.`);
    }

    get(dependencyType, dependencyChain) {
        dependencyChain = dependencyChain || [this._dependencyNameFrom(dependencyType)];
        var firstRepeatedDependency = this._firstRepeatedDependencyIn({ dependencyChain });

        if (firstRepeatedDependency) {
            var highlightedDependencyChain = select({
                from: dependencyChain,
                to: dependencyName =>
                    dependencyName == firstRepeatedDependency.dependencyName
                        ? `**${dependencyName}**`
                        : dependencyName
            });

            throw new Error(`Circular dependency detected in: ${highlightedDependencyChain.join(' <- ') }.`);
        }

        var dependencyTypes = select({
            from: this._getDependencyNamesFrom(dependencyType),
            to: dependencyName => this._dependencyTypeFrom({ dependencyName })
        });

        return this._createInjectedInstanceOf({ dependencyType, withDependencies: select({
                from: dependencyTypes,
                to: dependencyType => this._toConstructedDependency({
                    dependencyType,
                    dependencyChain: dependencyChain.concat(this._dependencyNameFrom(dependencyType))
                })
            })
        });
    }

    _firstRepeatedDependencyIn({dependencyChain}) {
        var countsOfDependencies = select({
            from: dependencyChain,
            to: dependencyName => {
                return {
                    dependencyName,
                    count: count({ from: dependencyChain, matching: element => element === dependencyName })
                };
            }
        });

        return first({
            from: countsOfDependencies,
            matching: countOfDependency => countOfDependency.count > 1
        });
    }

    _dependencyTypeFrom({dependencyName}) {
        var dependency = first({
            from: this._registeredDependencies,
            matching: regDep => regDep.dependencyName === dependencyName
        });

        if (dependency == null)
            throw new Error(`Un-registered dependency '${dependencyName}'.`);

        return dependency.construct || dependency.constant;
    }

    _getUnNamedDependencyStringFrom(dependencyType) {
        var code = dependencyType
            .toString()
            .replace(/\s/g, '');

        return code.substr(0, code.indexOf(")") + 1);
    }

    _getArgNamesFrom(dependencyType) {
        var code = dependencyType
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

    _getDependencyNamesFrom(dependencyType) {
        var args = this._getArgNamesFrom(dependencyType);
        return typeof (dependencyType.prototype) === "undefined"
            || typeof (dependencyType.prototype.dependencies) === "undefined"
            ? args
            : dependencyType.prototype.dependencies;
    }

    _toConstructedDependency({dependencyType, dependencyChain}) {
        if (this._getDependencyNamesFrom(dependencyType).length > 0)
            return this.get(dependencyType, dependencyChain);
        else
            return typeof (dependencyType) == "function" ? new dependencyType() : dependencyType;
    }

    _dependencyNameFrom(dependencyType) {
        return (first({
            from: this._registeredDependencies,
            matching: binding => binding.construct == dependencyType
        }) || { dependencyName: this._getUnNamedDependencyStringFrom(dependencyType) }).dependencyName;
    }

    _createInjectedInstanceOf({dependencyType, withDependencies}) {
        var args = [null].concat(withDependencies);
        var FactoryFunction = dependencyType.bind.apply(dependencyType, args);
        return new FactoryFunction();
    }
};