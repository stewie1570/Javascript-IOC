import { select, first, count, sum } from './utilities/array-helpers';
import { zip, zipToObject } from './utilities';

export class Ioc {

    constructor() {
        this._bindings = [];
    }

    bind(dependencyName, {to, toConstructor, toConstant, toMethod}) {
        var isBindingValid = sum(select({
            from: [to, toConstructor, toConstant, toMethod],
            to: bindingType => bindingType ? 1 : 0
        })) === 1;

        if (isBindingValid) {
            var useConstructor = toConstructor || typeof (to) == 'function';
            var binding = {
                dependencyName,
                dependencyType: to || (useConstructor ? toConstructor : toConstant),
                isConstant: !useConstructor,
                method: toMethod
            };
            this._bindings.push(binding);
        }
        else
            throw new Error(`Unable to bind "${dependencyName}". Binding must contain one (and only one) of the following properties: "to", "toConstructor", "toMethod" or "toConstant".`);
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
        var bindings = this._bindingsFromNames({ dependencyNames });
        var constructedDependencies = this._constructedDependenciesFrom({ bindings, dependencyChain });

        return this._createInjectedInstanceOf({
            dependencyType,
            withDependencies: this._objectMatchedConstructedDependenciesFrom({ dependencyNames, constructedDependencies })
        });
    }
    
    getDependencyGraphOf(dependencyType){
        var dependencyNames = this._getDependencyNamesFrom({dependencyType});
        dependencyNames = Array.isArray(dependencyNames[0]) ? dependencyNames[0] : dependencyNames;
        var bindingsForDependencies = this._bindingsFromNames({ dependencyNames });
        
        return {
            name: this._dependencyNameFrom({dependencyType}),
            dependencies: select({
                from: bindingsForDependencies,
                to: binding => this.getDependencyGraphOf(binding.dependencyType)
            }) 
        };
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

    _constructedDependenciesFrom({bindings, dependencyChain}) {
        return select({
            from: bindings,
            to: binding => Array.isArray(binding)
                ? this._constructedDependenciesFrom({ bindings: binding, dependencyChain })
                : this._constructedDependencyFrom({
                    binding,
                    dependencyChain: dependencyChain.concat(this._dependencyNameFrom({ dependencyType: binding.dependencyType }))
                })
        });
    }

    _bindingsFromNames({dependencyNames}) {
        return select({
            from: dependencyNames,
            to: dependencyName => Array.isArray(dependencyName)
                ? this._bindingsFromNames({ dependencyNames: dependencyName })
                : this._bindingFrom({ dependencyName })
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

    _bindingFrom({dependencyName}) {
        var dependency = first({
            from: this._bindings,
            matching: regDep => regDep.dependencyName === dependencyName
        });

        if (dependency == null)
            throw new Error(`Un-registered dependency '${dependencyName}'.`);

        return dependency;
    }

    _getUnNamedDependencyStringFrom({dependencyType}) {
        var code = dependencyType.toString();
        var dependencyStringFromUnNamedFunction = code => code.substr(0, code.indexOf(")") + 1);
        var dependencyStringFromNamedFunction = code => {
            var str = code.replace(/^function\s/, '');
            return str.substr(0, str.indexOf(")") + 1).replace(/\([a-zA-Z0-9_]*\)$/, '()');
        };
        
        return code.search(/^function\s?\(/) >= 0
            ? dependencyStringFromUnNamedFunction(code)
            : dependencyStringFromNamedFunction(code);
    }

    _getArgNamesFrom({dependencyType}) {
        if (!dependencyType) return [];

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
        return !dependencyType
            || typeof (dependencyType.prototype) === "undefined"
            || typeof (dependencyType.prototype.dependencies) === "undefined"
            ? args
            : dependencyType.prototype.dependencies;
    }

    _constructedDependencyFrom({binding, dependencyChain}) {
        if (this._getDependencyNamesFrom({ dependencyType: binding.dependencyType }).length > 0)
            return this.get(binding.dependencyType, dependencyChain);
        else
            return typeof (binding.dependencyType) == "function" && !binding.isConstant
                ? new binding.dependencyType()
                : binding.dependencyType || binding.method();
    }

    _dependencyNameFrom({dependencyType}) {
        return (first({
            from: this._bindings,
            matching: binding => binding.dependencyType == dependencyType
        }) || { dependencyName: this._getUnNamedDependencyStringFrom({ dependencyType }) }).dependencyName;
    }

    _createInjectedInstanceOf({dependencyType, withDependencies}) {
        var args = [null].concat(withDependencies);
        var FactoryFunction = dependencyType.bind.apply(dependencyType, args);
        return new FactoryFunction();
    }
};