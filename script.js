prettyNumber = { Infinity: '&infin;', NaN: '-' }
n3 = (x, i) => (i % 3 == 2 ? '\u202F' + x : x)
formatNumber = n => prettyNumber[n] ? prettyNumber[n] : (n + '').split('.').map((x, i) => i == 0 ? x.split('').reverse().map(n3).reverse().join('') : x.split('').map(n3).join('')).join('.');

hsl = h => `color: hsl(${h},100%,50%);`;
// <td type='float'>${data.po_fo}</td>
// <td type='int'>${data.gdp_dens}</td> 
row = data => `<tr> 
			<td type='rank'></td>
			<td type='string'>${data.country}</td>  

			<td type='int'>${formatNumber(data.co2_M)}</td> 
			<td type='int'>${formatNumber(data.forest_K)}</td> 
			<td type='int'>${formatNumber(data.pop_M)}</td> 
			<td type='int'>${formatNumber(data.gdp_G)}</td> 
			<td type='int'>${formatNumber(data.area_K)}</td> 

			<td type='int' sort='${data.po_fo2}' style='${hsl(120 - (data.po_fo2 > 1400 ? 140 : (data.po_fo2 / 12)))}'>${formatNumber(data.po_fo2)}</td> 
			<td type='int' sort='${data.po_do}' style='${hsl(120 - (data.po_do > 1400 ? 140 : (data.po_do / 12)))}'>${formatNumber(data.po_do)}</td> 
			<td type='int' sort='${data.po_pe}' style='${hsl(120 - (data.po_pe > 14 ? 140 : (data.po_pe * 9)))}'>${formatNumber(data.po_pe)}</td> 

			<td type='int' style='${hsl(120 - (data.pop_dens > 150 ? 150 : (data.pop_dens * 1)))}'>${data.pop_dens}</td> 
			<td type='int' style='${hsl((data.gdp_pp > 20000 ? 100 : (data.gdp_pp / 200)))}' sort='${data.gdp_pp}'>${formatNumber(data.gdp_pp)}&#8239;$</td> 
			<td type='int' style='${hsl(data.forest_dens * 1.2)}'>${data.forest_dens}&#8239;%</td> 
			<td type='int' style='color:${data.diff < 0 ? 'red' : 'green'}'>${formatNumber(data.diff)}</td> 
		</tr>`;


DATA = {}
async function fetchData(name) {
	let data = await fetch(`data/${name}.tsv`).then(x => x.text());
	// console.log('fetch', name, data);
	for (let line of data.split('\n')) {
		let [key, value] = line.split('\t');
		if (!DATA[key]) DATA[key] = { country: key };
		DATA[key][name] = value.replace(/,/g, '') * 1;
	}
}
async function loadAll() {
	await fetchData('forest');
	await fetchData('co2');
	await fetchData('population');
	await fetchData('gdp');
	await fetchData('area');
	// let data = {};
	// for (let country in forest)
	// 	if (pollution[country] && population[country] && gdp[country] && area[country])
	// 		data[country] = { country, ...forest[country], ...co2[country], ...population[country], ...gdp[country], ...area[country] };
	// console.log(data);
	// return data;
}
function calculate() {
	for (let country in DATA) {
		let x = DATA[country];
		if (Object.keys(x).length < 5 || x.co2 < 2) {
			console.log('delete', x)
			delete DATA[country];
			continue;
		}

		// for (let item in x) x[item] = x[item].replace(/,/g, '');
		x.co2_M = Math.round(x.co2 * 1);
		x.forest_K = Math.round(x.forest / 1000);
		x.gdp_G = Math.round(x.gdp / 1000);
		// if(item.forestKilo == 0) item.forestKilo = 0.01;
		x.pop_M = Math.round(x.population / 1000 / 1000);
		x.area_K = Math.round(x.area / 1000);
		x.po_fo = (x.co2_M / (x.forest_K ? x.forest_K : 1)).toFixed(2)
		x.po_fo2 = Math.round(x.co2_M * 1000 / x.forest_K)
		x.po_do = Math.round(x.co2_M * 1000 / x.gdp_G);
		x.po_pe = (x.co2_M / x.pop_M).toFixed(1);
		x.pop_dens = Math.round(x.population / x.area);
		x.gdp_pp = Math.round(x.gdp / x.pop_M);
		x.forest_dens = Math.round(x.forest * 100 / x.area);
		x.gdp_dens = Math.round(x.gdp * 1000 / x.area);
		x.diff = Math.round(x.forest_K - x.co2_M);
	}
}


(async function () {
	await loadAll();
	delete DATA.country
	calculate();
	console.log(DATA);
	console.log(DATA.Germany)
	let table = document.querySelector('table');
	for (let country in DATA) {
		table.tBodies[0].insertAdjacentHTML('beforeend', row(DATA[country]))
	}
})()

