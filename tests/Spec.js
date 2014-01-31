/// <reference path="jasmine.js" />
/// <reference path="../ioc.js" />


describe("Dependency Injector", function ()
{
    var Dependency = null;
    var Implementation = null;

    beforeEach(function ()
    {
        Dependency1 = function ()
        {
            this.prop1 = "success1";
        };
        Dependency2 = function ()
        {
            this.prop1 = "success2";
        };
        Implementation = function (dependency1, dependency2)
        {
            this.prop1 = dependency1.prop1;
            this.prop2 = dependency2.prop1;
        };
        Implementation2 = function(impl)
        {
            this.success = impl.prop1;
        };
        ioc.bindToConstructor("impl", Implementation);
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);
        ioc.bindToConstant("constTest", "constant success");
    });

    it("bind should automatically call bindToConstructor or bindToConstant", function ()
    {
        ioc.registeredDependencies = [];
        ioc.bind("testConst", { prop: "constant worked" });
        ioc.bind("testConstruct", function () { this.prop = "constructor works"; });
        var impl = function (testConst, testConstruct)
        {
            this.testConst = testConst;
            this.testConstruct = testConstruct
        }
        var inst = ioc.get(impl);
        expect(inst.testConst.prop).toBe("constant worked");
        expect(inst.testConstruct.prop).toBe("constructor works");
    });

    it("should support nested dependencies", function()
    {
        expect(ioc.get(Implementation2).success).toBe("success1");
    });

    it("should inject dependencies by contstructor argument names", function ()
    {
        var impl = ioc.get(Implementation);
        expect(impl.prop1).toBe("success1");
        expect(impl.prop2).toBe("success2");
    });

    it("should be able to get constructor argument names", function ()
    {
        Constructor = function (arg1, arg2) { };
        var argNames = ioc.helpers.getArgNames(Constructor);
        expect(argNames).toEqual(["arg1", "arg2"]);
    });

    it("should know when constructors dont have dependencies", function ()
    {
        Constructor = function () { };
        var argNames = ioc.helpers.getArgNames(Constructor);
        expect(argNames).toEqual([]);
    });

    it("should throw exception for requested/un-registered dependencies", function ()
    {
        Constructor = function (unknownDep) { };
        var exception = "";
        try
        {
            ioc.get(Constructor);
        }
        catch (ex)
        {
            exception = ex;
        }
        expect(exception).not.toBe("");
    });

    it("should support binding to constants, not just constructors", function ()
    {
        Implementation = function (constTest) { this.prop1 = constTest; };
        expect(ioc.get(Implementation).prop1).toBe("constant success");
    });
});