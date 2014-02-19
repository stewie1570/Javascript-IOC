/// <reference path="jasmine.js" />
/// <reference path="../ioc.js" />


describe("Dependency Injector", function ()
{
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
        ManualDepImpl = function (d1, d2)
        {
            this.prop1 = d1.prop1;
            this.prop2 = d2.prop1;
        };
        ManualDepImpl.prototype.dependencies = ["dependency1", "dependency2"];

        ioc.bindToConstructor("impl", Implementation);
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);
        ioc.bindToConstant("constTest", "constant success");
    });

    it("should support minification via declaring dependencies in prototype.dependencies property", function ()
    {
        //Arrange
        //Act
        var result = ioc.get(ManualDepImpl);

        //Assert
        expect(result.prop1).toBe("success1");
        expect(result.prop2).toBe("success2");
    });

    it("bind should automatically call bindToConstructor or bindToConstant", function ()
    {
        //Arrange
        ioc.bind("testConst", { prop: "constant worked" });
        ioc.bind("testConstruct", function () { this.prop = "constructor works"; });
        var impl = function (testConst, testConstruct)
        {
            this.testConst = testConst;
            this.testConstruct = testConstruct
        }

        //Act
        var inst = ioc.get(impl);

        //Assert
        expect(inst.testConst.prop).toBe("constant worked");
        expect(inst.testConstruct.prop).toBe("constructor works");
    });

    it("should support nested dependencies", function()
    {
        //Arrange
        //Act
        //Assert
        expect(ioc.get(Implementation2).success).toBe("success1");
    });

    it("should inject dependencies by contstructor argument names", function ()
    {
        //Arrange
        //Act
        var impl = ioc.get(Implementation);

        //Assert
        expect(impl.prop1).toBe("success1");
        expect(impl.prop2).toBe("success2");
    });

    it("should be able to get constructor argument names", function ()
    {
        //Arrange
        Constructor = function (arg1, arg2) { };

        //Act
        var argNames = ioc.helpers.getDependenciesOf(Constructor);

        //Assert
        expect(argNames).toEqual(["arg1", "arg2"]);
    });

    it("should know when constructors dont have dependencies", function ()
    {
        //Arrange
        Constructor = function () { };

        //Act
        var argNames = ioc.helpers.getDependenciesOf(Constructor);

        //Assert
        expect(argNames).toEqual([]);
    });

    it("should throw exception for requested/un-registered dependencies", function ()
    {
        //Arrange
        Constructor = function (unknownDep) { };
        var exception = "";

        //Act
        try
        {
            ioc.get(Constructor);
        }
        catch (ex)
        {
            exception = ex;
        }

        //Assert
        expect(exception).toContain("'unknownDep'");
    });

    it("should support binding to constants, not just constructors", function ()
    {
        //Arrange
        Implementation = function (constTest) { this.prop1 = constTest; };

        //Act
        //Assert
        expect(ioc.get(Implementation).prop1).toBe("constant success");
    });
});