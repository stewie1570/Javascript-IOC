Javascript-IOC
==============

A simple JavaScript IOC that ties constructor arguments (dependencies) to variables or other constructors recursively.

Here is some example usage from the unit tests:

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
            expect(inst.testConst.prop).toBe("constant worked");
            expect(inst.testConstruct.prop).toBe("constructor works");
        });
    });





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
        //...
        ioc.bindToConstructor("dependency1", Dependency1);
        ioc.bindToConstructor("dependency2", Dependency2);
        //...
    });
    
    it("should inject dependencies into classes", function ()
    {
        //Arrange
        class ClassImpl{
            constructor(dependency1, dependency2){
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
    
    it("should inject class instance into class", function ()
    {
        //Arrange
        class Dep{
            constructor(dependency1){
                this.prop1 = dependency1.prop1;
            }
        }
        
        class ClassImpl{
            constructor(dep){
                this.prop1 = dep.prop1;
            }
        }
        
        ioc.bind("dep", Dep);
        
        //Act
        var impl = ioc.get(ClassImpl);

        //Assert
        expect(impl.prop1).to.equal("success1");
    });