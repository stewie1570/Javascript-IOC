export class Ioc {

    constructor() {
        this.registeredDependencies = [];
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
        var dependencyNameFrom = dependency => (this.arrayFirst(
            this.registeredDependencies,
            binding => binding.construct == dependency) || { argName: null }).argName;
        var hasRepeats = array => this.arrayAny(
            array,
            element => this.arrayCount(array, e => e === element) > 1);
        var dependencies = this.arraySelect(this.getDependenciesOf(constructor), this.toDependencyObject);
        
        if (!dependencyChain)
            dependencyChain = [dependencyNameFrom(constructor)];

        if (hasRepeats(dependencyChain))
            throw new Error(`Circular dependency detected: ${dependencyChain.join(' <- ')}.`);

        var constructedDependencies = this.arraySelect(
            dependencies,
            dependency => this.toConstructedDependency(
                dependency,
                dependencyChain.concat(dependencyNameFrom(dependency))));

        return this.createInjectedInstanceOf(constructor, constructedDependencies);
    }

    createInjectedInstanceOf(construct, argArray) {
        var args = [null].concat(argArray);
        var FactoryFunction = construct.bind.apply(construct, args);
        return new FactoryFunction();
    }

    toConstructedDependency(dependency, dependencyChain) {
        if (this.getDependenciesOf(dependency).length > 0)
            return this.get(dependency, dependencyChain);
        else
            return typeof (dependency) == "function" ? new dependency() : dependency;
    }

    toDependencyObject(arg) {
        var dependency = this.arrayFirst(this.registeredDependencies, regDep => regDep.argName == arg);
        if (dependency == null)
            throw new Error(`Un-registered dependency '${arg}'.`);
        return dependency.construct || dependency.constant;
    }

    arraySelect(arr, del) {
        var ret = [];
        for (var i = 0; i < arr.length; i++) ret.push(del.call(this, arr[i]));
        return ret;
    }
    
    arrayAny(arr, del) {
        for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) return true;
        return false;
    }

    arrayFirst(arr, del) {
        for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) return arr[i];
        return null;
    }
    
    arrayCount(arr, del) {
        var count = 0;
        for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) count++;
        return count;
    }

    getDependenciesOf(construct) {
        var args = this.getArgNames(construct);
        return typeof (construct.prototype) === "undefined"
            || typeof (construct.prototype.dependencies) === "undefined"
            ? args
            : construct.prototype.dependencies;
    }

    getArgNames(construct) {
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
};