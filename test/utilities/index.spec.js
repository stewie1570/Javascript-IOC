import {zip, zipToObject} from '../../src/utilities';

describe("Utilities: ", () => {
	describe("ZipToObject", () => {
		it("should iterate through 2 arrays", () => {
			//Arrange
			var array1 = [1, 2, 3];
			var array2 = ["one", "two", "three"];
			
			//Act
			var result = zipToObject(array1, array2, (first, second) => { return { [second]: first }; });
			
			//Assert
			expect(result).toEqual({
				one: 1,
				two: 2,
				three: 3
			});
		});
		
		it("should not iterate past length of first array", () => {
			//Arrange
			var array1 = [1, 2];
			var array2 = ["one", "two", "three"];
			
			//Act
			var result = zipToObject(array1, array2, (first, second) => { return { [second]: first }; });
			
			//Assert
			expect(result).toEqual({
				one: 1,
				two: 2
			});
		});
		
		it("should not iterate past length of second array", () => {
			//Arrange
			var array1 = [1, 2, 3];
			var array2 = ["one", "two"];
			
			//Act
			var result = zipToObject(array1, array2, (first, second) => { return { [second]: first }; });
			
			//Assert
			expect(result).toEqual({
				one: 1,
				two: 2
			});
		});
	});
	
	describe("Zip", () => {
		it("should iterate through 2 arrays", () => {
			//Arrange
			var array1 = [1, 2, 3];
			var array2 = ["one", "two", "three"];
			
			//Act
			var result = zip(array1, array2, (first, second) => { return { [second]: first }; });
			
			//Assert
			expect(result).toEqual([
				{one: 1},
				{two: 2},
				{three: 3}
			]);
		});
		
		it("should not iterate past length of first array", () => {
			//Arrange
			var array1 = [1, 2];
			var array2 = ["one", "two", "three"];
			
			//Act
			var result = zip(array1, array2, (first, second) => { return { [second]: first }; });
			
			//Assert
			expect(result).toEqual([
				{one: 1},
				{two: 2}
			]);
		});
		
		it("should not iterate past length of second array", () => {
			//Arrange
			var array1 = [1, 2, 3];
			var array2 = ["one", "two"];
			
			//Act
			var result = zip(array1, array2, (first, second) => { return { [second]: first }; });
			
			//Assert
			expect(result).toEqual([
				{one: 1},
				{two: 2}
			]);
		});
	});
});