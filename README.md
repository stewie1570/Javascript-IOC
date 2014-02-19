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