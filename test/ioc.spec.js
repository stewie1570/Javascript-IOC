import { Ioc } from '../src/ioc'

describe("Dependency Injector", () => {
    var Dependency1,
        Dependency2,
        Implementation,
        Implementation2,
        ManualDepImpl,
        ioc;

    beforeEach(() => ioc = new Ioc());

    describe("Binding", () => {
        it("should support creating instances that have no dependencies", () => {
            Dependency1 = function () {
                this.prop = "success";
            }

            expect(ioc.get(Dependency1).prop).toEqual("success");
        });

        it("should get instance by contract name", () => {
            Dependency1 = function () {
                this.prop = "success";
            }

            ioc.bind("DependencyName", { toConstructor: Dependency1 });

            expect(ioc.get("DependencyName").prop).toEqual("success");
        });

        it("should get JSON object by contract name", () => {
            ioc.bind("DependencyName", { to: { test: "it worked" } });

            expect(ioc.get("DependencyName").test).toEqual("it worked");
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
            expect(result.prop1).toEqual("success1");
            expect(result.prop2).toEqual("success2");
        });

        it("should support shallow ES6 object matching", () => {
            //Arrange
            Dependency1 = function () {
                this.prop1 = "success1";
            };
            Dependency2 = function () {
                this.prop1 = "success2";
            };
            ManualDepImpl = function ({dependency1, dependency2}) {
                this.prop1 = dependency1.prop1;
                this.prop2 = dependency2.prop1;
            };
            ManualDepImpl.prototype.dependencies = [["dependency1", "dependency2"]];
            ioc.bind("dependency1", { toConstructor: Dependency1 });
            ioc.bind("dependency2", { toConstructor: Dependency2 });

            //Act
            var result = ioc.get(ManualDepImpl);

            //Assert
            expect(result.prop1).toEqual("success1");
            expect(result.prop2).toEqual("success2");
        });

        it("should support shallow ES6 object matching with other dependencies", () => {
            //Arrange
            Dependency1 = function () {
                this.prop1 = "success1";
            };
            Dependency2 = function () {
                this.prop1 = "success2";
            };
            ManualDepImpl = function (dependency0, {dependency1, dependency2}, dependency3) {
                this.prop0 = dependency0;
                this.prop1 = dependency1.prop1;
                this.prop2 = dependency2.prop1;
                this.prop3 = dependency3;
            };
            ManualDepImpl.prototype.dependencies = ["dependency0", ["dependency1", "dependency2"], "dependency3"];
            ioc.bind("dependency0", { toConstant: "success0" });
            ioc.bind("dependency1", { toConstructor: Dependency1 });
            ioc.bind("dependency2", { toConstructor: Dependency2 });
            ioc.bind("dependency3", { toConstant: "success3" });

            //Act
            var result = ioc.get(ManualDepImpl);

            //Assert
            expect(result.prop0).toEqual("success0");
            expect(result.prop1).toEqual("success1");
            expect(result.prop2).toEqual("success2");
            expect(result.prop3).toEqual("success3");
        });

        it("should automatically bind to constructor or bind to constant", () => {
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
            expect(inst.testConst.prop).toEqual("constant worked");
            expect(inst.testConstruct.prop).toEqual("constructor works");
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
            expect(ioc.get(Implementation2).success).toEqual("success1");
        });

        it("should get instance via contract name from binding that requires nested dependencies", () => {
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
            ioc.bind("TheImplementation", { toConstructor: Implementation2 });

            //Act
            //Assert
            expect(ioc.get("TheImplementation").success).toEqual("success1");
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
            expect(impl.prop1).toEqual("success1");
            expect(impl.prop2).toEqual("success2");
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
            expect(impl.prop1).toEqual("success1");
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
            expect(impl.prop1).toEqual("success1");
            expect(impl.prop2).toEqual("success2");
        });

        it("should support binding to constant", () => {
            //Arrange
            ioc.bind("constTest", { toConstant: "constant success" });
            Implementation = function (constTest) { this.prop1 = constTest; };

            //Act
            //Assert
            expect(ioc.get(Implementation).prop1).toEqual("constant success");
        });

        it("should support binding to method", () => {
            //Arrange
            ioc.bind("methodTest", { toMethod: () => "method success" });
            Implementation = function (methodTest) { this.prop1 = methodTest; };

            //Act
            //Assert
            expect(ioc.get(Implementation).prop1).toEqual("method success");
        });

        it("should support binding to functions as constants", () => {
            //Arrange
            ioc.bind("provider", { toConstant: () => "constant success" });
            Implementation = function (provider) { this.prop1 = provider(); };

            //Act
            //Assert
            expect(ioc.get(Implementation).prop1).toEqual("constant success");
        });

        it("should return original JSON object when getting injected instance of a JSON object", () => {
            var origObject = { test: "some value" };
            expect(ioc.get(origObject)).toEqual(origObject);
        })
    });

    describe("Dependency Graph", () => {
        it("should be a recursive object describing the dependency tree for the given type", () => {
            //Arrange
            class ScoreBoard { }
            class Parser { }
            class Provider {
                constructor({userInput, parser, scorer}) {
                    this.userInput = userInput;
                    this.parser = parser;
                    this.scorer = scorer;
                }
            }
            Provider.prototype.dependencies = [["userInput", "parser", "scorer"]];
            class Controller {
                constructor(view, provider) {
                    this.view = view;
                    this.provider = provider;
                }
            }

            ioc.bind("view", { to: {} });
            ioc.bind("scorer", { to: ScoreBoard });
            ioc.bind("parser", { to: Parser });
            ioc.bind("userInput", { toMethod: () => "user input" });
            ioc.bind("provider", { to: Provider });

            //Act
            var dependencyGraph = ioc.getDependencyGraphOf(Controller);

            //Assert
            expect(dependencyGraph).toEqual({
                name: "Controller",
                dependencies: [
                    { name: "view", dependencies: [] },
                    {
                        name: "provider",
                        dependencies: [
                            { name: "userInput", dependencies: [] },
                            { name: "parser", dependencies: [] },
                            { name: "scorer", dependencies: [] }
                        ]
                    }
                ]
            });
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
            expect(exceptionMessage).toContain("'unknownDep'");
        });

        it("should throw exception for incomplete bindings", () => {
            //Arrange
            var exceptionMessage = '';

            //Act
            try {
                ioc.bind("dependency", { unknownProp: "with some value" });
            }
            catch (error) {
                exceptionMessage = error.message;
            }

            //Assert
            expect(exceptionMessage).toEqual('Unable to bind "dependency". Binding must contain one (and only one) of the following properties: "to", "toConstructor", "toMethod" or "toConstant".');
        });

        it("should throw exception for invalid binding when auto binding and manual binding at the same time", () => {
            //Arrange
            var exceptionMessage = '';

            //Act
            try {
                ioc.bind("dependency", { to: "some value", toConstant: "some other value" });
            }
            catch (error) {
                exceptionMessage = error.message;
            }

            //Assert
            expect(exceptionMessage).toEqual('Unable to bind "dependency". Binding must contain one (and only one) of the following properties: "to", "toConstructor", "toMethod" or "toConstant".');
        });

        it("should throw exception for invalid binding when doing multiple manual binding types at the same time", () => {
            //Arrange
            var exceptionMessage = '';

            //Act
            try {
                ioc.bind("dependency", { toConstructor: function () { }, toConstant: "some other value" });
            }
            catch (error) {
                exceptionMessage = error.message;
            }

            //Assert
            expect(exceptionMessage).toEqual('Unable to bind "dependency". Binding must contain one (and only one) of the following properties: "to", "toConstructor", "toMethod" or "toConstant".');
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
            expect(errorMessage).toEqual("Circular dependency detected in: Implementation2 <- **Implementation** <- dependency2 <- dependency1 <- **Implementation**.")
        });

        it("should throw when circular dependency is detected while getting instance via contract name", () => {
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
            ioc.bind("TheImplementation", { toConstructor: Implementation2 });

            //Act
            var errorMessage = "";
            try {
                var impl = ioc.get("TheImplementation");
            }
            catch (error) { errorMessage = error.message; }

            //Assert
            expect(errorMessage).toEqual("Circular dependency detected in: TheImplementation <- **Implementation** <- dependency2 <- dependency1 <- **Implementation**.")
        });

        it("should throw \"DependencyName\" has no binding when getting instance by contract name that is not bound", () => {
            Dependency1 = function () {
                this.prop = "success";
            }

            var errorMessage = "";
            try {
                ioc.get("DependencyName");
            }
            catch (error) { errorMessage = error.message; }

            expect(errorMessage).toEqual("\"DependencyName\" has no dependency binding.");
        });

    });
});