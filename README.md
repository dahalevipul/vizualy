# Vizualy
> 
Vizualy is a charting library based on **JavaScript** and **D3.js**

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
```
Make sure to use/import vizualy-assistant/src/css/common.css in your code-base as per recommended by frontend framework being used
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

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)