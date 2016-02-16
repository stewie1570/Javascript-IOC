import { select, first, count, sum } from './utilities/array-helpers';
import { zip, zipToObject } from './utilities';

export class Ioc {

    constructor() {
        this._registeredDependencies = [];
    }

    bind(dependencyName, bind) {
        var isBindingValid = sum(select({
            from: [bind.to, bind.toConstructor, bind.toConstant],
            to: bindingType => bindingType ? 1 : 0
        })) === 1;

        if (isBindingValid) {
            var useConstructor = bind.toConstructor || typeof (bind.to) == 'function';
            var binding = {
                dependencyName,
                dependencyType: bind.to || (useConstructor ? bind.toConstructor : bind.toConstant),
                isConstant: !useConstructor
            };
            this._registeredDependencies.push(binding);
        }
        else
            throw new Error(`Unable to bind "${dependencyName}". Binding must contain one (and only one) of the following properties: "to", "toConstructor" or "toConstant".`);
    }

    get(dependencyType, dependencyChain) {
        dependencyChain = dependencyChain || [this._dependencyNameFrom({ dependencyType })];
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

        var dependencyNames = this._getDependencyNamesFrom({ dependencyType });
        var dependencies = this._dependenciesFromNames({ dependencyNames });
        var constructedDependencies = this._constructedDependenciesFrom({ dependencies, dependencyChain });

        return this._createInjectedInstanceOf({
            dependencyType,
            withDependencies: this._objectMatchedConstructedDependenciesFrom({ dependencyNames, constructedDependencies })
        });
    }

    _objectMatchedConstructedDependenciesFrom({dependencyNames, constructedDependencies}) {
        return zip(dependencyNames, constructedDependencies, (name, constructedDependency) => {
            var isObjectMatching = Array.isArray(name) && Array.isArray(constructedDependency);
            return isObjectMatching
                ? zipToObject(name, constructedDependency, (name, constructedDependency) => {
                    return { [name]: constructedDependency };
                })
                : constructedDependency;
        });
    }

    _constructedDependenciesFrom({dependencies, dependencyChain}) {
        return select({
            from: dependencies,
            to: dependency => Array.isArray(dependency)
                ? this._constructedDependenciesFrom({ dependencies: dependency, dependencyChain })
                : this._constructedDependencyFrom({
                    dependencyType: dependency.dependencyType,
                    isConstant: dependency.isConstant,
                    dependencyChain: dependencyChain.concat(this._dependencyNameFrom({ dependencyType: dependency.dependencyType }))
                })
        });
    }

    _dependenciesFromNames({dependencyNames}) {
        return select({
            from: dependencyNames,
            to: dependencyName => Array.isArray(dependencyName)
                ? this._dependenciesFromNames({ dependencyNames: dependencyName })
                : this._dependencyFrom({ dependencyName })
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

    _dependencyFrom({dependencyName}) {
        var dependency = first({
            from: this._registeredDependencies,
            matching: regDep => regDep.dependencyName === dependencyName
        });

        if (dependency == null)
            throw new Error(`Un-registered dependency '${dependencyName}'.`);

        return dependency;
    }

    _getUnNamedDependencyStringFrom({dependencyType}) {
        var code = dependencyType
            .toString()
            .replace(/\s/g, '');

        return code.substr(0, code.indexOf(")") + 1);
    }

    _getArgNamesFrom({dependencyType}) {
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

    _getDependencyNamesFrom({dependencyType}) {
        var args = this._getArgNamesFrom({ dependencyType });
        return typeof (dependencyType.prototype) === "undefined"
            || typeof (dependencyType.prototype.dependencies) === "undefined"
            ? args
            : dependencyType.prototype.dependencies;
    }

    _constructedDependencyFrom({dependencyType, dependencyChain, isConstant}) {
        if (this._getDependencyNamesFrom({ dependencyType }).length > 0)
            return this.get(dependencyType, dependencyChain);
        else
            return typeof (dependencyType) == "function" && !isConstant ? new dependencyType() : dependencyType;
    }

    _dependencyNameFrom({dependencyType}) {
        return (first({
            from: this._registeredDependencies,
            matching: binding => binding.dependencyType == dependencyType
        }) || { dependencyName: this._getUnNamedDependencyStringFrom({ dependencyType }) }).dependencyName;
    }

    _createInjectedInstanceOf({dependencyType, withDependencies}) {
        var args = [null].concat(withDependencies);
        var FactoryFunction = dependencyType.bind.apply(dependencyType, args);
        return new FactoryFunction();
    }
};