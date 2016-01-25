import { Ioc } from  '../src/ioc';

describe("Dependency Injector", () => {
    var Dependency1,
        Dependency2,
        Implementation,
        Implementation2,
        ManualDepImpl,
        ioc;

    beforeEach(() => ioc = new Ioc());

    describe("Binding", () => {
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

            ioc.bind("dependency1", { toConstructor: Dependency1 });
            ioc.bind("dep", { to: Dep });
        
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
            ioc.bind("dependency1", { toConstructor: Dependency1 });
            ioc.bind("dependency2", { toConstructor: Dependency2 });
        
            //Act
            var impl = ioc.get(Implementation);

            //Assert
            expect(impl.prop1).to.equal("success1");
            expect(impl.prop2).to.equal("success2");
        });

        it("should support binding to constants, not just constructors", () => {
            //Arrange
            ioc.bind("constTest", { toConstant: "constant success" });
            Implementation = function (constTest) { this.prop1 = constTest; };

            //Act
            //Assert
            expect(ioc.get(Implementation).prop1).to.equal("constant success");
        });
    });

    describe("Error Handling", () => {

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

        it("should throw when circular dependency is detected", () => {
            //Arrange
            Dependency1 = function (Implementation) {
            };
            Dependency2 = function (dependency1) {
            };
            Implementation = function (dependency2) {
            };
            Implementation2 = function (Implementation) {
            }
            ioc.bind("Implementation", { toConstructor: Implementation });
            ioc.bind("dependency1", { toConstructor: Dependency1 });
            ioc.bind("dependency2", { toConstructor: Dependency2 });
        
            //Act
            var errorMessage = "";
            try {
                var impl = ioc.get(Implementation2);
            }
            catch (error) { errorMessage = error.message; }

            //Assert
            expect(errorMessage).to.equal("Circular dependency detected in: function(Implementation) <- **Implementation** <- dependency2 <- dependency1 <- **Implementation**.")
        });

    });
});