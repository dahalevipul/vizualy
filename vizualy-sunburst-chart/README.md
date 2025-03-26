# Sunburst Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Sunburst Chart**.

```bash
npm install @impetusuxp/vizualy-sunburst-chart
```

### Sample Data (Chart's required data format)

    const data = {
        "name": "TOPICS",
        "children": [{
            "name": "Topic A",
            "title": "A",
            "color" : "#d92626",
            "children": [{
                "name": "Topic 1", "title": "A1",
                "children": [{ "name": "Sub A1", "title": "sub a1", "size": 3 }, { "name": "Sub A2", "title": "sub a2", "size": 4 }]
            }, {
                "name": "Topic 2",
                "children": [{ "name": "Sub 2", "title": "sub a2", "size": 3 }]
            }
                , {
                "name": "Topic 3",
                "children": [{ "name": "Sub 2", "title": "sub a2", "size": 3 }]
            }]
        },
        {
            "name": "Topic B",
            "title": "B",
            "color" : "#006580",
            "children": [{ "name": "Sub B1", "title": "B", "size": 3 }, { "name": "Sub B2", "title": "B", "size": 3 }, { "name": "Sub B3", "title": "B", "size": 3 }]
        },
        {
            "name": "Topic C",
            "title": "C",
            "color" : "#A3DD72",
            "children": [{ "name": "Sub A1", "title": "C", "size": 4 }, { "name": "Sub A2", "title": "C", "size": 4 }]
        },
        {
            "name": "Topic D",
            "title": "D",
            "color" : "#A3DD00",
            "children": [{ "name": "Sub A1", "title": "D", "size": 4 }, { "name": "Sub A2", "title": "D", "size": 4 }]
        }]
    };

## Usage

1.
```
import SunburstChart from '@impetusuxp/vizualy-sunburst-chart';

const sunburstChart = new SunburstChart();

// Draw chart
sunburstrChart
      .container('containerID')
      .x('x axis key in data') // Referred as "name" in sample data
      .y('y axis key in data') // Referred as "size" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
sunburstChart.data(updated data object).update();
```
   2.
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-sunburst-chart/vizualy-sunburst-chart.js"></script>
<script>
const sunburstchart = new vizualy.SunburstChart();

// Draw chart
sunburstChart
      .container('containerID')
      .x('x axis key in data') // Referred as "name" in sample data
      .y('y axis key in data') // Referred as "size" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
sunburstChart.data(updated data object).update();
</script>
```
```
Make sure to use/import vizualy-assistant/src/css/common.css in your code-base as per recommended by frontend framework being used
```
## Configurations/Settings
1)
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
content| Function | Chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

2)
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

3)
```
isResponsive: true
```
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.


4)
```
emptyDataMessage: 'No Data Available'
```
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

5)
```
exceptionMessage: 'Something went wrong!! Please see logs.'
```
Key | Type | Default | Description
----|-------- | -------|------
exceptionMessage| String | 'Something went wrong!! Please see logs.'| To customize message to be displayed on screen when any error occurs.

6)
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

7)
```
showSequence: false
```
Key | Type | Default | Description
----|-------- | -------|------
showSequence | Boolean | False | Show in sequence.

8)
```
sequenceContainerId: ""
```
Key | Type | Default | Description
----|-------- | -------|------
sequenceContainerId | String | Empty | Sequence container ID for sunburst chart.

9)
```
donut: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
donut| Boolean | True | Turn on Donut mode.

10)
```
donutRatio: 0.5
``` 
Key | Type | Default | Description
----|-------- | -------|------
donutRatio| Number | 0 | Configure how big you want the donut hole size to be.

11)
```
showTooltip: true
```
Key | Type | Default | Description
----|-------- | -------|------
showTooltip | Boolean | True | Configure whether to show tooltip or not.

12)
```
label: {
    isVisible: true,
    dataKey: null,
    textFormat: (d) => d
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible | Boolean | True | To show/hide label.
dataKey | String | null | Property key in data as label text.
textFormat | Function | Default value | To customize text format of radial.

13)
```
legendContainer: ""
```
Key | Type | Default | Description
----|-------- | -------|------
legendContainer | String| "" | A container for legends.

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
sunburstrChart.getElement("arc").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(arc).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)