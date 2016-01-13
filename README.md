Javascript-IOC
==============

[![Build](https://api.travis-ci.org/stewie1570/Javascript-IOC.svg)]
(https://travis-ci.org/stewie1570/Javascript-IOC)

A simple JavaScript IOC that ties constructor arguments (dependencies) to variables or other constructors recursively.

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
