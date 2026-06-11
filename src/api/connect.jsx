const BASE = '/api';

async function request(path, options = {}) {
	const res = await fetch(`${BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...options,
	});
	let data = null;
	try {
		data = await res.json();
	} catch (e) {
		data = null;
	}
	return { ok: res.ok, status: res.status, data}
}

export const signIn = async ({ Email, password }) => {
	return request('/signIn', {
		method: 'POST',
		body: JSON.stringify({ Email, password }),
	});
};

export const getReports = async () => {
	return request('/report', { method: 'GET'});
};

export const createReport = async (payload) => {
	return request('/report', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
};

export const getReportLists = async () => {
	return request('/reportlist', { method: 'GET' });
};

export const createReportList = async (payload) => {
	return request('/reportlist', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
};

export default {
	signIn,
	getReports,
	createReport,
	getReportLists,
	createReportList,
};
