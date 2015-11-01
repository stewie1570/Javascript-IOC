import { ioc } from  '../src/ioc';
import 'phantomjs-polyfill';

describe("Dependency Injector", function ()
{
    var Dependency1,
        Dependency2,
        Implementation,
        Implementation2,
        ManualDepImpl;
        
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
        expect(result.prop1).to.equal("success1");
        expect(result.prop2).to.equal("success2");
    });

    describe("bind", function ()
    {
        it("should automatically call bindToConstructor or bindToConstant", function ()
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
            expect(inst.testConst.prop).to.equal("constant worked");
            expect(inst.testConstruct.prop).to.equal("constructor works");
        });
    });

    it("should support nested dependencies", function()
    {
        //Arrange
        //Act
        //Assert
        expect(ioc.get(Implementation2).success).to.equal("success1");
    });

    it("should inject dependencies by contstructor argument names", function ()
    {
        //Arrange
        //Act
        var impl = ioc.get(Implementation);

        //Assert
        expect(impl.prop1).to.equal("success1");
        expect(impl.prop2).to.equal("success2");
    });

    it("should be able to get constructor argument names", function ()
    {
        //Arrange
        var Constructor = function (arg1, arg2) { };

        //Act
        var argNames = ioc.helpers.getDependenciesOf(Constructor);

        //Assert
        expect(argNames).to.deep.equal(["arg1", "arg2"]);
    });

    it("should know when constructors dont have dependencies", function ()
    {
        //Arrange
        var Constructor = function () { };

        //Act
        var argNames = ioc.helpers.getDependenciesOf(Constructor);

        //Assert
        expect(argNames).to.deep.equal([]);
    });

    it("should throw exception for requested/un-registered dependencies", function ()
    {
        //Arrange
        var Constructor = function (unknownDep) { };
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
        expect(exception).to.contain("'unknownDep'");
    });

    it("should support binding to constants, not just constructors", function ()
    {
        //Arrange
        Implementation = function (constTest) { this.prop1 = constTest; };

        //Act
        //Assert
        expect(ioc.get(Implementation).prop1).to.equal("constant success");
    });
});