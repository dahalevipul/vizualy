# Pie Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Pie Chart**.

```bash
npm install @impetusuxp/vizualy-pie-chart
```

### Sample Data (Chart's required data format)

    const data = [{
        Client: "Company A",
        Percentage: 0.2,
        color: "red"
    }, {
        Client: "Company B",
        Percentage: 2.0,
    }, {
        Client: "Company C",
        Percentage: 2.0,
        color: "blue"
    }, {
        Client: "Company D",
        Percentage: 2.0,
    }, {
        Client: "Other",
        Percentage: 100,
        color: "yellow"
    }];

## Usage

1. 
```
import PieChart from '@impetusuxp/vizualy-pie-chart';

const pieChart = new PieChart();

// Draw chart
pieChart
      .container('containerID')
      .data(data object) // Referred to sample data
      .value('value key in data') // Referred as "Percentage" in sample data
      .label('label key in data') // Referred as "Client" in sample data
      .settings(chart configuration object)
      .draw();

// Update chart
pieChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-pie-chart/vizualy-pie-chart.js"></script>
<script>
const pieChart = new vizualy.PieChart();

// Draw chart
pieChart
      .container('containerID')
      .data(data object) // Referred to sample data
      .value('value key in data') // Referred as "Percentage" in sample data
      .label('label key in data') // Referred as "Client" in sample data
      .settings(chart configuration object)
      .draw();

// Update chart
pieChart.data(updated data object).update();
</script>
```
```
Make sure to use/import vizualy-assistant/src/css/common.css in your code-base as per recommended by frontend framework being used
```
## Configurations/Settings
1)
```
dimension: {
    width: 500,
    height: 500,
    margin: { top: 20, right: 20, bottom: 40, left: 40 }
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
width | Number in px | Default width of container | To provide custom width to chart.
height| Number in px | Default height of container | To provide custom height to chart.
margin| Object | { top: 20, right: 20, bottom: 40, left: 40 } | To provide margin to chart.

2)
```
donut: {
    isApplied: true,
    thickness: { type: 'ratio', value: .5 }
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isApplied| Boolean | True | To show/hide donut
thickness | Object | { type: 'ratio', value: .5 } | To provide thickness of donut.


3)
```
label: {
    isVisible: true,
    placement: 'in-out',
    dataKey: null,
    textFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide label.
placement| String(in-out, in, out) | 'in-out' | To provide placement of label.
dataKey| String | null | Property key in data as label text.
textFormat | Function | Default label | To customize labels inside pie.

4)
```
tooltip: {
    isVisible: true,
    content: (d, chartObject) => "Some html",
    placement: "top-right"
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the tooltip in active/hidden state
content| Function | Pie chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

5)
```
animation: {
    isApplied: true,
    duration: 750,
    type: 'cubic'
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isApplied| Boolean | True | To activate/deactivate animations
duration| Number(in ms) | 750 | duration of animation
type| String("elastic", "bounce", "linear", "sin", "quad", "cubic", "poly", "circle", "exp", "back") | 'cubic' | type of animation.

6)
```
isResponsive: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.


7)
```
emptyDataMessage: 'No Data Available'
``` 
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

8)
```
exceptionMessage: 'Something went wrong!! Please see logs.'
``` 
Key | Type | Default | Description
----|-------- | -------|------
exceptionMessage| String | 'Something went wrong!! Please see logs.'| To customize message to be displayed on screen when any error occurs.

9)
```
legend: {
    isVisible: true,
    placement: 'right',
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    rectWidth: 10,
    rectHeight: 10,
    textKey: null,
    textFormat: (d) => d,
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the legend in active/hidden state.
placement| String("right", "center", "left") | 'right' | Placement(direction) at the top of charts.
margin| Object | { top: 10, right: 10, bottom: 10, left: 10 } | To provide margin to legends.
rectWidth| number | 10 | Width of legend rectangle.
rectHeight| number | 10 | Height of legend rectangle.
textKey| String | null | Property key in data as legend text.
textFormat | Function | Default text | To customize legend text available via argument(d).

### Chart's life cycle hooks:-
```
chartObject.on('beforeDraw', () => { // do something })
chartObject.on('completeDraw', () => { // do something })
chartObject.on('beforeUpdate', () => { // do something })
chartObject.on('completeUpdate, () => { // do something })
chartObject.on('beforeResize', () => { // do something })
chartObject.on('completeResize', () => { // do something })
``` 
Key | Type | Default | Description
----|-------- | -------|------
on| Function('eventId', handler) | No action | To perform custom actions on mentioned events.


## Event subscription

```
pieChart.getElement("pie").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(pie).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)