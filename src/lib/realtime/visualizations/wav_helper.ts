const dataMap = new WeakMap();

/**
 * Normalizes a Float32Array to Array(m): We use this to draw amplitudes on a graph
 * If we're rendering the same audio data, then we'll often be using
 * the same (data, m, downsamplePeaks) triplets so we give option to memoize
 */
export const normalizeArray = (
	data: Float32Array,
	m: number,
	downsamplePeaks: boolean = false,
	memoize: boolean = false
) => {
	let cache, mKey, dKey;
	if (memoize) {
		mKey = m.toString();
		dKey = downsamplePeaks.toString();
		cache = dataMap.has(data) ? dataMap.get(data) : {};
		dataMap.set(data, cache);
		cache[mKey] = cache[mKey] || {};
		if (cache[mKey][dKey]) {
			return cache[mKey][dKey];
		}
	}
	const n = data.length;
	const result = new Array(m);
	if (m <= n) {
		// Downsampling
		result.fill(0);
		const count = new Array(m).fill(0);
		for (let i = 0; i < n; i++) {
			const index = Math.floor(i * (m / n));
			if (downsamplePeaks) {
				// take highest result in the set
				result[index] = Math.max(result[index], Math.abs(data[i]));
			} else {
				result[index] += Math.abs(data[i]);
			}
			count[index]++;
		}
		if (!downsamplePeaks) {
			for (let i = 0; i < result.length; i++) {
				result[i] = result[i] / count[i];
			}
		}
	} else {
		for (let i = 0; i < m; i++) {
			const index = (i * (n - 1)) / (m - 1);
			const low = Math.floor(index);
			const high = Math.ceil(index);
			const t = index - low;
			if (high >= n) {
				result[i] = data[n - 1];
			} else {
				result[i] = data[low] * (1 - t) + data[high] * t;
			}
		}
	}
	if (memoize) {
		cache[mKey as string][dKey as string] = result;
	}
	return result;
};