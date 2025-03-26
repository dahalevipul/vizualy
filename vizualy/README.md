# Vizualy
> 
**Vizualy** is a easy to use, configuration driven charting library based on **JavaScript** and **D3.js** empowering users to create interactive data visualizations.

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Vizualy**.

```bash
npm install @impetusuxp/vizualy
```

## Usage

1. 
```
import vizualy from '@impetusuxp/vizualy';

const BarChart = vizualy.getChart('BarChart');
const barChart = new BarChart();

// Draw chart (https://www.npmjs.com/package/@impetusuxp/vizualy-bar-chart)
barChart
      .container('containerID')
      .x('x axis key in data')
      .y('y axis key in data')
      .data(data object)
      .settings(unified configuration object) // Not mandatory to call. Chart takes its default settings.
      .draw();

// Update chart
barChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-bar-chart/vizualy-bar-chart.js"></script>
<script>
const barchart = new vizualy.BarChart();

// Draw chart
barChart
      .container('containerID')
      .x('x axis key in data')
      .y('y axis key in data')
      .data(data object)
      .settings(unified configuration object) // Not mandatory to call. Chart takes its default settings.
      .draw();

// Update chart
barChart.data(updated data object).update();
</script>
```

## Characteristics
- Framework agnostic
- Easy to use APIs
- Various configurations
- Animation
- Event observers
- Responsive charts
- Life cycle hooks 
- Centralized error handling
- General purpose utility methods


# Vizualy Charts Documentation

For detailed usage instructions, properties, and methods of each chart, refer to below readme files.

[Area Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-area-chart)<br/>
[Bar Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-bar-chart)<br/>
[Bubble Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-bubble-chart)<br/>
[Circle Packing Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-circle-packing-chart)<br/>
[Horizontal Bullet Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-horizontal-bullet-chart)<br/>
[Horizontal Grouped Bar Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-horizontal-grouped-bar-chart)<br/>
[Horizontal Stacked Bar Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-horizontal-stacked-bar-chart)<br/>
[Line Bar Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-line-bar-chart)<br/>
[Line Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-line-chart)<br/>
[Network Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-network-chart)<br/>
[Pie Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-pie-chart)<br/>
[Radial Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-radial-chart)<br/>
[SunBurst Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-sunburst-chart)<br/>
[Vertical Grouped Bar Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-vertical-grouped-bar-chart)<br/>
[Vertical Stacked Bar Chart] (https://www.npmjs.com/package/@impetusuxp/vizualy-vertical-stacked-bar-chart)<br/>


## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)