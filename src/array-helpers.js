export var select = ({from, to}) => {
	var ret = [];
	for (var i = 0; i < from.length; i++) ret.push(to.call(this, from[i]));
	return ret;
}

export var first = ({from, matching}) => {
	for (var i = 0; i < from.length; i++) if (matching.call(this, from[i])) return from[i];
	return null;
}

export var count = ({from, matching}) => {
	var count = 0;
	for (var i = 0; i < from.length; i++) if (matching.call(this, from[i])) count++;
	return count;
}

export var sum = array => {
	var count = 0;
	for (var i = 0; i < array.length; i++) count += array[i];
	return count;
}