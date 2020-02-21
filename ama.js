
const out = document.getElementById('Questions'), qs = [],
	pollURL = 'https://prod-79.westus.logic.azure.com/workflows/0fff45d9ef6b49a491180d0388eb8768/triggers/manual/paths/invoke/' + new Date().toISOString() + '?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Fwg8V0oF01LrKi5Mdvtj8KLJQcyZpZNvSgO80W8lnTs'; // eslint-disable-line max-len
setTimeout(poll, 5000);
// Poll - create, pull, push (fake sms)
	function sms(txt) {
		return fetch('https://prod-27.westus.logic.azure.com:443/workflows/454efec86a2646c7b5844cffe7f9092e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tTGANvq07OwfvBc3kT85_sbtWqbK5-BTspawoRf-VgA', // eslint-disable-line max-len
			{ method: 'POST', body: 'Body=' + txt, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
	}
	window.sms = sms;
	async function poll() {
		const r = (await (await fetch(pollURL)).json()),
			words = r.words.filter(q => !qs.includes(q));
		words.forEach(q => out.insertAdjacentHTML('beforeend', `<li>${q}</li>`));
		qs.push(...words);
		setTimeout(poll, 5000);
	}
