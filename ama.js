
let last = new Date(); const out = document.getElementById('Questions');
setTimeout(poll, 5000);
// Poll - create, pull, push (fake sms)
	function sms(txt) {
		return fetch('https://prod-31.westcentralus.logic.azure.com:443/workflows/550447cbd013422a9d5da2043d97cc2a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bX4hxretdBK4bNDkcyZdCd5aVAmN1XbNvZMojC4IazU', // eslint-disable-line max-len
			{ method: 'POST', body: 'Body=' + txt, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
	}
	window.sms = sms;
	async function poll() {
		(await (await fetch('https://prod-21.westcentralus.logic.azure.com/workflows/28b63b907d0d492c91d9fde2218f6aab/triggers/manual/paths/invoke/' + last.toISOString() + '?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=4N_NRkHJsn_S6sbAIUh1n9jilo36u9zgqg4v5CAsKRw')).json()) // eslint-disable-line max-len
			.forEach(q => out.insertAdjacentHTML('beforeend', `<li>${q}</li>`));
		last = new Date();
		setTimeout(poll, 2000);
	}