const fs = require("fs").promises;
const ProgressBar = require("progress");

async function main() {
	const jsonA = JSON.parse(await fs.readFile("jsonA.json", "utf8"));
	const R = 6371;
	const pi = Math.PI;
	const kmMilesConversion = 1 / 1.609344;

	function calculateDistance(position1, position2) {
		const dLat = toRad(position2.latitude-position1.latitude);
		const dLon = toRad(position2.longitude-position1.longitude);
		const position1latituderad = toRad(position1.latitude);
		const position2latituderad = toRad(position2.latitude);

		const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(position1latituderad) * Math.cos(position2latituderad) * Math.sin(dLon/2) * Math.sin(dLon/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const d = R * c;
		return kmToMiles(d);
	}
	function toRad(value) {
		return value * pi / 180;
	}
	function kmToMiles(value) {
		return kmMilesConversion * value;
	}

	const bar = new ProgressBar("[:bar] :current :rate/bps :elapsed :percent :etas", { "total": jsonA.length });
	const val = jsonA.reduce((acc, currentValue, index, array) => {
		array.slice(index + 1).forEach((item, indexB) => {
			const id = parseInt(currentValue.id) > parseInt(item.id) ? `${currentValue._id}-${item._id}` : `${item._id}-${currentValue._id}`;
			if (!acc[id]) {
				acc[id] = calculateDistance({
					"latitude": parseFloat(currentValue.lat),
					"longitude": parseFloat(currentValue.lon)
				}, {
					"latitude": parseFloat(item.lat),
					"longitude": parseFloat(item.lon)
				});
			}
		});

		bar.tick();
		return acc;
	}, {});
	await fs.writeFile("jsonB.json", JSON.stringify(val));
}
main();
