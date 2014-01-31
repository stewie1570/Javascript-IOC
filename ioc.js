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

    get: function (construct)
    {
        var args = this.helpers.getArgNames(construct);
        var self = this;
        var depConstructsOrConsts = this.helpers.arraySelect(args, function (arg)
        {
            var dependency = self.helpers.arrayFirst(self.registeredDependencies, function (regDep)
            {
                return regDep.argName == arg;
            });
            if (dependency == null)
                throw "Un-registered dependency '" + arg + "'.";
            return dependency.construct || dependency.constant;
        });
        var constructedDependencies = this.helpers.arraySelect(depConstructsOrConsts, function (depConstructOrConst)
        {
            if (self.helpers.getArgNames(depConstructOrConst).length > 0)
                return self.get(depConstructOrConst);
            else
                return typeof (depConstructOrConst) == "function"
                    ? new depConstructOrConst()
                    : depConstructOrConst;
        });
        return this.applyToConstructor(construct, constructedDependencies);
    },

    applyToConstructor: function (construct, argArray)
    {
        var args = [null].concat(argArray);
        var factoryFunction = construct.bind.apply(construct, args);
        return new factoryFunction();
    },
        
    helpers: {
        arraySelect: function (arr, del)
        {
            var ret = [];
            for (var i = 0; i < arr.length; i++) ret.push(del(arr[i]));
            return ret;
        },

        arrayFirst: function (arr, del)
        {
            for (var i = 0; i < arr.length; i++) if (del(arr[i])) return arr[i];
            return null;
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