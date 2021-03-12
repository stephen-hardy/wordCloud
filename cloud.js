/* global d3: false */
// https://www.jasondavies.com/wordcloud/
// https://github.com/jasondavies/d3-cloud
let fontSize, last, lastPoll = new Date();
const w = 1000, h = 1000, cld = d3.layout.cloud(), q = document.getElementById('Question'),
	svg = d3.select('#Cloud'), anim = svg.append('g'), vis = svg.append('g').attr('transform', `translate(${[w / 2, h / 2]})`);
{ // poll setup
	const hash = decodeURI(location.hash || '#').slice(1);
	q.addEventListener('change', evt => (location.hash = encodeURI(evt.target.value)));
	q.value = hash;
	setTimeout(getPoll, 5000);
}
{ // cloud setup
	const angles = 2, linScale = d3.scale.linear();
	linScale.domain([0, angles - 1]).range([0, 90]); // angle from (-60 -> 0) | angle to (60 -> 90)
	cld.font('Impact').spiral('rectangular').rotate(_ => linScale(~~(Math.random() * angles))); // spiral = archimedean || rectangular
	cld.timeInterval(10).size([w, h]).fontSize(t => fontSize(+t.value)).text(t => t.key).on('end', draw);
}
// Poll - create, pull, push (fake sms)
	function sms(txt) {
		return fetch('https://prod-27.westus.logic.azure.com:443/workflows/454efec86a2646c7b5844cffe7f9092e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tTGANvq07OwfvBc3kT85_sbtWqbK5-BTspawoRf-VgA', // eslint-disable-line max-len
			{ method: 'POST', body: 'Body=' + txt, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
	}
	window.sms = sms;
	async function getPoll() {
		parseText(await (await fetch('https://prod-79.westus.logic.azure.com/workflows/0fff45d9ef6b49a491180d0388eb8768/triggers/manual/paths/invoke/' + lastPoll.toISOString() + '?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Fwg8V0oF01LrKi5Mdvtj8KLJQcyZpZNvSgO80W8lnTs')).json()); // eslint-disable-line max-len
		// lastPoll = new Date();
		setTimeout(getPoll, 2000);
	}
window.addEventListener('hashchange', _ => {
	q.value = decodeURI(location.hash || '#').slice(1);
	parseText([]);
});
document.getElementById('Cloud').addEventListener('dblclick', evt => {
	const a = document.createElement('a');
	a.setAttribute('href', 'data:image/svg+xml;base64,'
		+ window.btoa('<svg xmlns="http://www.w3.org/2000/svg"' + evt.currentTarget.outerHTML.slice(28)));
	a.setAttribute('download', 'wordCloud.svg');
	a.click();
});
function parseText(r) {
	const txt = r.words.join(' ');
	if (txt === last) { return; } // no need to refresh word cloud SVG if the inputs haven't changed
	last = txt;
	document.getElementById('Logo').hidden = !!txt; // hide logo/qr when words were parsed
	document.getElementById('Cloud')[txt ? 'removeAttribute' : 'setAttribute']('hidden', ''); // hide cloud SVG when no words were parsed
	let tags = {}; const e = {}, words = txt.split(/\s+/).filter(Boolean);
	words.forEach(t => {
		const lower = t.toLowerCase();
		e[lower] = t;
		tags[lower] = (tags[lower] || 0) + 1;
	});
	{
		function toTxt(o) { return `${(o[1] / words.length * 100).toFixed(0)}% say ${o[0]}`; }
		document.getElementById('Stats').innerText = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 3).map(toTxt).join(', ');
	}
	tags = d3.entries(tags).sort((a, b) => b.value - a.value);
	tags.forEach(t => (t.key = e[t.key]));
	fontSize = d3.scale.sqrt().range([25, 100]); // log, sqrt, linear
	tags.length && fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
	cld.stop().words(tags).start();
}
function draw(words, bounds) {
	function thing(d, i, x) { return d / Math.abs(bounds[i][x] - (d / 2)); }
	const scale = bounds ? Math.min(thing(w, 1, 'x'), thing(w, 0, 'x'), thing(h, 1, 'y'), thing(h, 0, 'y')) / 2 : 1,
		fill = d3.scale.category20b(), n = vis.selectAll('text').data(words, t => t.text.toLowerCase());
	function toTranslate(t) { return `translate(${[t.x, t.y]})rotate(${t.rotate})`; }
	n.transition().duration(1000).attr('transform', toTranslate).style('font-size', t => t.size + 'px');
	n.enter().append('text').attr('text-anchor', 'middle').attr('transform', toTranslate)
		.style('font-size', '1px').transition().duration(1000)
		.style('font-size', t => t.size + 'px');
	n.style('font-family', t => t.font).style('fill', t => fill(t.text.toLowerCase())).text(t => t.text);
	const a = anim.append('g').attr('transform', vis.attr('transform')), r = a.node();
	n.exit().each(function exitEach() { r.appendChild(this); });
	a.transition().duration(1000).style('opacity', 1e-6).remove();
	vis.transition().delay(1000).duration(750).attr('transform', `translate(${[w / 2, h / 2]})scale(${scale})`);
}
