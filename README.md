#javascript-ioc

[![Build](https://api.travis-ci.org/stewie1570/Javascript-IOC.svg)](https://travis-ci.org/stewie1570/Javascript-IOC)
[![npm version](https://badge.fury.io/js/javascript-ioc.svg)](https://badge.fury.io/js/javascript-ioc)

A simple JavaScript IOC that ties constructor arguments (dependencies) to variables or other constructors recursively.

This library is framework agnostic and is not intended to be used as a service locator. Ideally you'll organize and define your dependency bindings in the bootstrapping of your application and then call the ioc.get method from a single location in your code that gives your chosen framework the constructed object. This can help give your application a more decoupled design. You could even decouple your app from the framework ;) This library has a very simple API that could be replaced by another IOC later if you wish.

Here is some example usage from the unit tests:

    import { Ioc } from 'javascript-ioc';
    
    ...
    beforeEach(() => ioc = new Ioc());
    ...
    
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
        ioc.bind("impl", { toConstructor: Implementation });
        ioc.bind("dependency1", { toConstructor: Dependency1 });
        ioc.bind("dependency2", { toConstructor: Dependency2 });
    
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
        ioc.bind("dependency1", { toConstructor: Dependency1 });
        ioc.bind("dependency2", { toConstructor: Dependency2 });

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
        ioc.bind("dependency1", { toConstructor: Dependency1 });
        ioc.bind("dependency2", { toConstructor: Dependency2 });
    
        //Act
        var result = ioc.get(ManualDepImpl);

        //Assert
        expect(result.prop1).to.equal("success1");
        expect(result.prop2).to.equal("success2");
    });
    
    it("should support binding to constants, not just constructors", () => {
        //Arrange
        ioc.bind("constTest", { toConstant: "constant success" });
        Implementation = function (constTest) { this.prop1 = constTest; };

        //Act
        //Assert
        expect(ioc.get(Implementation).prop1).to.equal("constant success");
    });
    
    it("should automatically call bind to constructor or bind to constant", () => {
        //Arrange
        ioc.bind("testConst", { to: { prop: "constant worked" } });
        ioc.bind("testConstruct", { to: function () { this.prop = "constructor works"; } });
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
