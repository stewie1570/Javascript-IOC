export function zip(left, right, valueProvider) {
	var ret = [];
	var length = Math.min(left.length, right.length);
	for (var i = 0; i < length; i++) ret.push(valueProvider(left[i], right[i]));
	return ret;
}

export function zipToObject(left, right, valueProvider) {
	var ret = {};
	var length = Math.min(left.length, right.length);
	for (var i = 0; i < length; i++) {
		var val = valueProvider(left[i], right[i]);
		for(var key in val){
			ret[key] = val[key];
		}
	}
	return ret;
}