ioc = {
    registeredDependencies: [],

    bind: function(argName, obj)
    {
        if (typeof (obj) == "function")
            this.bindToConstructor(argName, obj);
        else
            this.bindToConstant(argName, obj);
    },

    bindToConstructor: function (argName, construct)
    {
        this.registeredDependencies.push({ argName: argName, construct: construct });
    },

    bindToConstant: function(argName, constant)
    {
        this.registeredDependencies.push({ argName: argName, constant: constant });
    },

    get: function (constructor)
    {
        var dependencies = this
            .helpers
            .arraySelect
            .call(this, this.helpers.getDependenciesOf(constructor), this.helpers.toDependencyObjects);

        var constructedDependencies = this
            .helpers
            .arraySelect
            .call(this, dependencies, this.helpers.toConstructedDependencies);

        return this
            .helpers
            .createInjectedInstance(constructor, constructedDependencies);
    },
        
    helpers: {
        createInjectedInstance: function (construct, argArray)
        {
            var args = [null].concat(argArray);
            var factoryFunction = construct.bind.apply(construct, args);
            return new factoryFunction();
        },

        toConstructedDependencies: function (dependency)
        {
            if (this.helpers.getDependenciesOf(dependency).length > 0)
                return this.get(dependency);
            else
                return typeof (dependency) == "function" ? new dependency() : dependency;
        },

        toDependencyObjects: function (arg)
        {
            var dependency = this.helpers.arrayFirst.call(this, this.registeredDependencies, function (regDep)
            {
                return regDep.argName == arg;
            });
            if (dependency == null)
                throw "Un-registered dependency '" + arg + "'.";
            return dependency.construct || dependency.constant;
        },

        arraySelect: function (arr, del)
        {
            var ret = [];
            for (var i = 0; i < arr.length; i++) ret.push(del.call(this, arr[i]));
            return ret;
        },

        arrayFirst: function (arr, del)
        {
            for (var i = 0; i < arr.length; i++) if (del.call(this, arr[i])) return arr[i];
            return null;
        },

        getDependenciesOf: function (construct)
        {
            var args = this.getArgNames(construct);
            return typeof (construct.prototype) === "undefined"
                || typeof (construct.prototype.dependencies) === "undefined"
                    ? args
                    : construct.prototype.dependencies;
        },

        getArgNames: function (construct)
        {
            var code = construct
                .toString()
                .replace(/\s/g, '');
            var start = code.indexOf("(") + 1;
            var end = code.indexOf(")");

            if (start < 0 || end < 0 || end - start < 1)
                return [];
            else
            {
                return code
                    .substring(start, end)
                    .split(",");
            }
        }
    }
};