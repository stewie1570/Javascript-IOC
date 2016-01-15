export var select = ({from, to}) => {
	var ret = [];
	for (var i = 0; i < from.length; i++) ret.push(to.call(this, from[i]));
	return ret;
}

export var any = ({from, matching}) => {
	for (var i = 0; i < from.length; i++) if (matching.call(this, from[i])) return true;
	return false;
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

export var hasRepeatsIn = array => any({
	from: array,
	matching: outer => count({ from: array, matching: inner => inner === outer }) > 1
});