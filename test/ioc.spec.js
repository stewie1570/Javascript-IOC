import { Ioc } from  '../src/ioc';
import 'phantomjs-polyfill';

describe("Dependency Injector", () => {
    var Dependency1,
        Dependency2,
        Implementation,
        Implementation2,
        ManualDepImpl,
        ioc;

    beforeEach(() => ioc = new Ioc());

    it("should support minification via declaring dependencies in prototype.dependencies property", () => {
        //Arrange
        Dependency1 = function () {
            this.prop1 = "success1";
        };
        Dependency2 = function () {
            this.prop1 = "success2";
        };
        ManualDepImpl = function (d1, d2) {
            this.prop1 = d1.prop1;
            this.prop2 = d2.prop1;
        };
        ManualDepImpl.prototype.dependencies = ["dependency1", "dependency2"];
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);
        
        //Act
        var result = ioc.get(ManualDepImpl);

        //Assert
        expect(result.prop1).to.equal("success1");
        expect(result.prop2).to.equal("success2");
    });

    it("should automatically call bindToConstructor or bindToConstant", () => {
        //Arrange
        ioc.bind("testConst", { prop: "constant worked" });
        ioc.bind("testConstruct", function () { this.prop = "constructor works"; });
        var impl = function (testConst, testConstruct) {
            this.testConst = testConst;
            this.testConstruct = testConstruct
        }

        //Act
        var inst = ioc.get(impl);

        //Assert
        expect(inst.testConst.prop).to.equal("constant worked");
        expect(inst.testConstruct.prop).to.equal("constructor works");
    });

    it("should support nested dependencies recursively", () => {
        //Arrange
        Dependency1 = function () {
            this.prop1 = "success1";
        };
        Dependency2 = function () {
            this.prop1 = "success2";
        };
        Implementation = function (dependency1, dependency2) {
            this.prop1 = dependency1.prop1;
            this.prop2 = dependency2.prop1;
        };
        Implementation2 = function (impl) {
            this.success = impl.prop1;
        };
        ioc.bindToConstructor("impl", Implementation);
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);
        ioc.bindToConstant("constTest", "constant success");
        
        //Act
        //Assert
        expect(ioc.get(Implementation2).success).to.equal("success1");
    });

    it("should inject dependencies into classes", () => {
        //Arrange
        Dependency1 = function () {
            this.prop1 = "success1";
        };
        Dependency2 = function () {
            this.prop1 = "success2";
        };
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);

        class ClassImpl {
            constructor(dependency1, dependency2) {
                this.prop1 = dependency1.prop1;
                this.prop2 = dependency2.prop1;
            }
        }
        
        //Act
        var impl = ioc.get(ClassImpl);

        //Assert
        expect(impl.prop1).to.equal("success1");
        expect(impl.prop2).to.equal("success2");
    });

    it("should inject class instance into class", () => {
        //Arrange
        Dependency1 = function () {
            this.prop1 = "success1";
        };

        class Dep {
            constructor(dependency1) {
                this.prop1 = dependency1.prop1;
            }
        }

        class ClassImpl {
            constructor(dep) {
                this.prop1 = dep.prop1;
            }
        }

        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bind("dep", Dep);
        
        //Act
        var impl = ioc.get(ClassImpl);

        //Assert
        expect(impl.prop1).to.equal("success1");
    });

    it("should inject dependencies by contstructor argument names", () => {
        //Arrange
        Dependency1 = function () {
            this.prop1 = "success1";
        };
        Dependency2 = function () {
            this.prop1 = "success2";
        };
        Implementation = function (dependency1, dependency2) {
            this.prop1 = dependency1.prop1;
            this.prop2 = dependency2.prop1;
        };
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);
        
        //Act
        var impl = ioc.get(Implementation);

        //Assert
        expect(impl.prop1).to.equal("success1");
        expect(impl.prop2).to.equal("success2");
    });

    it("should be able to get constructor argument names", () => {
        //Arrange
        var Constructor = function (arg1, arg2) { };

        //Act
        var argNames = ioc.getDependenciesOf(Constructor);

        //Assert
        expect(argNames).to.deep.equal(["arg1", "arg2"]);
    });

    it("should know when constructors dont have dependencies", () => {
        //Arrange
        var Constructor = function () { };

        //Act
        var argNames = ioc.getDependenciesOf(Constructor);

        //Assert
        expect(argNames).to.deep.equal([]);
    });

    it("should throw exception for requested/un-registered dependencies", () => {
        //Arrange
        var Constructor = function (unknownDep) { };
        var exceptionMessage = "";

        //Act
        try {
            ioc.get(Constructor);
        }
        catch (error) {
            exceptionMessage = error.message;
        }

        //Assert
        expect(exceptionMessage).to.contain("'unknownDep'");
    });

    it("should support binding to constants, not just constructors", () => {
        //Arrange
        ioc.bindToConstant("constTest", "constant success");
        Implementation = function (constTest) { this.prop1 = constTest; };

        //Act
        //Assert
        expect(ioc.get(Implementation).prop1).to.equal("constant success");
    });
});