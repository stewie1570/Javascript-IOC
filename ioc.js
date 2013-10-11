ioc =
    {
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
            var registration = {
                argName: argName,
                construct: construct
            };
            this.registeredDependencies.push(registration);
        },
        bindToConstant: function(argName, constant)
        {
            var registration = {
                argName: argName,
                constant: constant
            };
            this.registeredDependencies.push(registration);
        },
        get: function (construct)
        {
            var args = this.getArgNames(construct);
            var self = this;
            var depConstructsOrConsts = this.arraySelect(args, function (arg)
            {
                var dependency = self.arrayFirst(self.registeredDependencies, function (regDep)
                {
                    return regDep.argName == arg;
                });
                if (dependency == null)
                    throw "Un-registered dependency '" + arg + "'.";
                return dependency.construct || dependency.constant;
            });
            var constructedDependencies = this.arraySelect(depConstructsOrConsts, function (depConstructOrConst)
            {
                if (self.getArgNames(depConstructOrConst).length > 0)
                    return self.get(depConstructOrConst);
                else
                    return typeof (depConstructOrConst) == "function"
                        ? new depConstructOrConst() : depConstructOrConst;
            });
            return this.applyToConstructor(construct, constructedDependencies);
        },
        applyToConstructor: function (construct, argArray)
        {
            var args = [null].concat(argArray);
            var factoryFunction = construct.bind.apply(construct, args);
            return new factoryFunction();
        },
        arraySelect: function (arr, del)
        {
            var ret = [];
            for (var i = 0; i < arr.length; i++)
            {
                ret.push(del(arr[i]));
            }
            return ret;
        },
        arrayFirst: function (arr, del)
        {
            for (var i = 0; i < arr.length; i++)
            {
                if (del(arr[i]))
                    return arr[i];
            }
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
    };