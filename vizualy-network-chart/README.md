# Network Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Network Chart**.

```bash
npm install @impetusuxp/vizualy-network-chart
```

## Sample Data
```
Make sure to refer sample data format at the last of this document.
```

## Usage

1. 
```
import NetworkChart from '@impetusuxp/vizualy-network-chart';

const networkChart = new NetworkChart();

// Draw chart
networkChart
      .container('containerID')
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
networkChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-network-chart/vizualy-network-chart.js"></script>
<script>
const networkChart = new vizualy.NetworkChart();

// Draw chart
networkChart
      .container('containerID')
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
networkChart.data(updated data object).update();
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


3)
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
content| Function | Network chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

4)
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
networkChart.getElement("circle").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(circle).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

### Sample Data (Chart's required data format)

    const data = {
        "nodes": [
            { "id": "Myriel", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Napoleon", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mlle.Baptistine", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mme.Magloire", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "CountessdeLo", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Geborand", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Champtercier", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Cravatte", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg" },
            { "id": "Count", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg" },
            { "id": "OldMan", "group": 1, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Labarre", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Valjean", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Marguerite", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mme.deR", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Isabeau", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Gervais", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Tholomyes", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Listolier", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Fameuil", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},	
            { "id": "Blacheville", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Favourite", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Dahlia", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},	
            { "id": "Zephine", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Fantine", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mme.Thenardier", "group": 4, "img": "./vizualy-network-chart/assets/images/user.svg"}, 
            { "id": "Thenardier", "group": 4, "img": "./vizualy-network-chart/assets/images/user.svg"	},		
            { "id": "Cosette", "group": 5, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Javert", "group": 4, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Fauchelevent", "group": 0, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Bamatabois", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},			
            { "id": "Perpetue", "group": 3, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Simplice", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg" },
            { "id": "Scaufflaire", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Woman1", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Judge", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Champmathieu", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Brevet", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Chenildieu", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Cochepaille", "group": 2, "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Pontmercy", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Boulatruelle", "group": 6 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Eponine", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Anzelma", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Woman2", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "MotherInnocent", "group": 0 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Gribier", "group": 0 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Jondrette", "group": 7 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mme.Burgon", "group": 7 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Gavroche", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Gillenormand", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Magnon", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mlle.Gillenormand", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mme.Pontmercy", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mlle.Vaubois", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Lt.Gillenormand", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Marius", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "BaronessT", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mabeuf", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Enjolras", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Combeferre", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Prouvaire", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Feuilly", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Courfeyrac", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Bahorel", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Bossuet", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Joly", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Grantaire", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "MotherPlutarch", "group": 9 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Gueulemer", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Babet", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Claquesous", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Montparnasse", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Toussaint", "group": 5 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Child1", "group": 10 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Child2", "group": 10 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Brujon", "group": 4 , "img": "./vizualy-network-chart/assets/images/user.svg"},
            { "id": "Mme.Hucheloup", "group": 8 , "img": "./vizualy-network-chart/assets/images/user.svg"}
        ],
        "links": [
            { "source": "Napoleon", "target": "Myriel", "value": 1 },
            { "source": "Mlle.Baptistine", "target": "Myriel", "value": 8 },
            { "source": "Mme.Magloire", "target": "Myriel", "value": 10 },
            { "source": "Mme.Magloire", "target": "Mlle.Baptistine", "value": 6 },
            { "source": "CountessdeLo", "target": "Myriel", "value": 1 },
            { "source": "Geborand", "target": "Myriel", "value": 1 },
            { "source": "Champtercier", "target": "Myriel", "value": 1 },
            { "source": "Cravatte", "target": "Myriel", "value": 1 },
            { "source": "Count", "target": "Myriel", "value": 2 },
            { "source": "OldMan", "target": "Myriel", "value": 1 },
            { "source": "Valjean", "target": "Labarre", "value": 1 },
            { "source": "Valjean", "target": "Mme.Magloire", "value": 3 },
            { "source": "Valjean", "target": "Mlle.Baptistine", "value": 3 },
            { "source": "Valjean", "target": "Myriel", "value": 5 },
            { "source": "Marguerite", "target": "Valjean", "value": 1 },
            { "source": "Mme.deR", "target": "Valjean", "value": 1 },
            { "source": "Isabeau", "target": "Valjean", "value": 1 },
            { "source": "Gervais", "target": "Valjean", "value": 1 },
            { "source": "Listolier", "target": "Tholomyes", "value": 4 },
            { "source": "Fameuil", "target": "Tholomyes", "value": 4 },
            { "source": "Fameuil", "target": "Listolier", "value": 4 },
            { "source": "Blacheville", "target": "Tholomyes", "value": 4 },
            { "source": "Blacheville", "target": "Listolier", "value": 4 },
            { "source": "Blacheville", "target": "Fameuil", "value": 4 },
            { "source": "Favourite", "target": "Tholomyes", "value": 3 },
            { "source": "Favourite", "target": "Listolier", "value": 3 },
            { "source": "Favourite", "target": "Fameuil", "value": 3 },
            { "source": "Favourite", "target": "Blacheville", "value": 4 },
            { "source": "Dahlia", "target": "Tholomyes", "value": 3 },
            { "source": "Dahlia", "target": "Listolier", "value": 3 },
            { "source": "Dahlia", "target": "Fameuil", "value": 3 },
            { "source": "Dahlia", "target": "Blacheville", "value": 3 },
            { "source": "Dahlia", "target": "Favourite", "value": 5 },
            { "source": "Zephine", "target": "Tholomyes", "value": 3 },
            { "source": "Zephine", "target": "Listolier", "value": 3 },
            { "source": "Zephine", "target": "Fameuil", "value": 3 },
            { "source": "Zephine", "target": "Blacheville", "value": 3 },
            { "source": "Zephine", "target": "Favourite", "value": 4 },
            { "source": "Zephine", "target": "Dahlia", "value": 4 },
            { "source": "Fantine", "target": "Tholomyes", "value": 3 },
            { "source": "Fantine", "target": "Listolier", "value": 3 },
            { "source": "Fantine", "target": "Fameuil", "value": 3 },
            { "source": "Fantine", "target": "Blacheville", "value": 3 },
            { "source": "Fantine", "target": "Favourite", "value": 4 },
            { "source": "Fantine", "target": "Dahlia", "value": 4 },
            { "source": "Fantine", "target": "Zephine", "value": 4 },
            { "source": "Fantine", "target": "Marguerite", "value": 2 },
            { "source": "Fantine", "target": "Valjean", "value": 9 },
            { "source": "Mme.Thenardier", "target": "Fantine", "value": 2 },
            { "source": "Mme.Thenardier", "target": "Valjean", "value": 7 },
            { "source": "Thenardier", "target": "Mme.Thenardier", "value": 13 },
            { "source": "Thenardier", "target": "Fantine", "value": 1 },
            { "source": "Thenardier", "target": "Valjean", "value": 12 },
            { "source": "Cosette", "target": "Mme.Thenardier", "value": 4 },
            { "source": "Cosette", "target": "Valjean", "value": 31 },
            { "source": "Cosette", "target": "Tholomyes", "value": 1 },
            { "source": "Cosette", "target": "Thenardier", "value": 1 },
            { "source": "Javert", "target": "Valjean", "value": 17 },
            { "source": "Javert", "target": "Fantine", "value": 5 },
            { "source": "Javert", "target": "Thenardier", "value": 5 },
            { "source": "Javert", "target": "Mme.Thenardier", "value": 1 },
            { "source": "Javert", "target": "Cosette", "value": 1 },
            { "source": "Fauchelevent", "target": "Valjean", "value": 8 },
            { "source": "Fauchelevent", "target": "Javert", "value": 1 },
            { "source": "Bamatabois", "target": "Fantine", "value": 1 },
            { "source": "Bamatabois", "target": "Javert", "value": 1 },
            { "source": "Bamatabois", "target": "Valjean", "value": 2 },
            { "source": "Perpetue", "target": "Fantine", "value": 1 },
            { "source": "Simplice", "target": "Perpetue", "value": 2 },
            { "source": "Simplice", "target": "Valjean", "value": 3 },
            { "source": "Simplice", "target": "Fantine", "value": 2 },
            { "source": "Simplice", "target": "Javert", "value": 1 },
            { "source": "Scaufflaire", "target": "Valjean", "value": 1 },
            { "source": "Woman1", "target": "Valjean", "value": 2 },
            { "source": "Woman1", "target": "Javert", "value": 1 },
            { "source": "Judge", "target": "Valjean", "value": 3 },
            { "source": "Judge", "target": "Bamatabois", "value": 2 },
            { "source": "Champmathieu", "target": "Valjean", "value": 3 },
            { "source": "Champmathieu", "target": "Judge", "value": 3 },
            { "source": "Champmathieu", "target": "Bamatabois", "value": 2 },
            { "source": "Brevet", "target": "Judge", "value": 2 },
            { "source": "Brevet", "target": "Champmathieu", "value": 2 },
            { "source": "Brevet", "target": "Valjean", "value": 2 },
            { "source": "Brevet", "target": "Bamatabois", "value": 1 },
            { "source": "Chenildieu", "target": "Judge", "value": 2 },
            { "source": "Chenildieu", "target": "Champmathieu", "value": 2 },
            { "source": "Chenildieu", "target": "Brevet", "value": 2 },
            { "source": "Chenildieu", "target": "Valjean", "value": 2 },
            { "source": "Chenildieu", "target": "Bamatabois", "value": 1 },
            { "source": "Cochepaille", "target": "Judge", "value": 2 },
            { "source": "Cochepaille", "target": "Champmathieu", "value": 2 },
            { "source": "Cochepaille", "target": "Brevet", "value": 2 },
            { "source": "Cochepaille", "target": "Chenildieu", "value": 2 },
            { "source": "Cochepaille", "target": "Valjean", "value": 2 },
            { "source": "Cochepaille", "target": "Bamatabois", "value": 1 },
            { "source": "Pontmercy", "target": "Thenardier", "value": 1 },
            { "source": "Boulatruelle", "target": "Thenardier", "value": 1 },
            { "source": "Eponine", "target": "Mme.Thenardier", "value": 2 },
            { "source": "Eponine", "target": "Thenardier", "value": 3 },
            { "source": "Anzelma", "target": "Eponine", "value": 2 },
            { "source": "Anzelma", "target": "Thenardier", "value": 2 },
            { "source": "Anzelma", "target": "Mme.Thenardier", "value": 1 },
            { "source": "Woman2", "target": "Valjean", "value": 3 },
            { "source": "Woman2", "target": "Cosette", "value": 1 },
            { "source": "Woman2", "target": "Javert", "value": 1 },
            { "source": "MotherInnocent", "target": "Fauchelevent", "value": 3 },
            { "source": "MotherInnocent", "target": "Valjean", "value": 1 },
            { "source": "Gribier", "target": "Fauchelevent", "value": 2 },
            { "source": "Mme.Burgon", "target": "Jondrette", "value": 1 },
            { "source": "Gavroche", "target": "Mme.Burgon", "value": 2 },
            { "source": "Gavroche", "target": "Thenardier", "value": 1 },
            { "source": "Gavroche", "target": "Javert", "value": 1 },
            { "source": "Gavroche", "target": "Valjean", "value": 1 },
            { "source": "Gillenormand", "target": "Cosette", "value": 3 },
            { "source": "Gillenormand", "target": "Valjean", "value": 2 },
            { "source": "Magnon", "target": "Gillenormand", "value": 1 },
            { "source": "Magnon", "target": "Mme.Thenardier", "value": 1 },
            { "source": "Mlle.Gillenormand", "target": "Gillenormand", "value": 9 },
            { "source": "Mlle.Gillenormand", "target": "Cosette", "value": 2 },
            { "source": "Mlle.Gillenormand", "target": "Valjean", "value": 2 },
            { "source": "Mme.Pontmercy", "target": "Mlle.Gillenormand", "value": 1 },
            { "source": "Mme.Pontmercy", "target": "Pontmercy", "value": 1 },
            { "source": "Mlle.Vaubois", "target": "Mlle.Gillenormand", "value": 1 },
            { "source": "Lt.Gillenormand", "target": "Mlle.Gillenormand", "value": 2 },
            { "source": "Lt.Gillenormand", "target": "Gillenormand", "value": 1 },
            { "source": "Lt.Gillenormand", "target": "Cosette", "value": 1 },
            { "source": "Marius", "target": "Mlle.Gillenormand", "value": 6 },
            { "source": "Marius", "target": "Gillenormand", "value": 12 },
            { "source": "Marius", "target": "Pontmercy", "value": 1 },
            { "source": "Marius", "target": "Lt.Gillenormand", "value": 1 },
            { "source": "Marius", "target": "Cosette", "value": 21 },
            { "source": "Marius", "target": "Valjean", "value": 19 },
            { "source": "Marius", "target": "Tholomyes", "value": 1 },
            { "source": "Marius", "target": "Thenardier", "value": 2 },
            { "source": "Marius", "target": "Eponine", "value": 5 },
            { "source": "Marius", "target": "Gavroche", "value": 4 },
            { "source": "BaronessT", "target": "Gillenormand", "value": 1 },
            { "source": "BaronessT", "target": "Marius", "value": 1 },
            { "source": "Mabeuf", "target": "Marius", "value": 1 },
            { "source": "Mabeuf", "target": "Eponine", "value": 1 },
            { "source": "Mabeuf", "target": "Gavroche", "value": 1 },
            { "source": "Enjolras", "target": "Marius", "value": 7 },
            { "source": "Enjolras", "target": "Gavroche", "value": 7 },
            { "source": "Enjolras", "target": "Javert", "value": 6 },
            { "source": "Enjolras", "target": "Mabeuf", "value": 1 },
            { "source": "Enjolras", "target": "Valjean", "value": 4 },
            { "source": "Combeferre", "target": "Enjolras", "value": 15 },
            { "source": "Combeferre", "target": "Marius", "value": 5 },
            { "source": "Combeferre", "target": "Gavroche", "value": 6 },
            { "source": "Combeferre", "target": "Mabeuf", "value": 2 },
            { "source": "Prouvaire", "target": "Gavroche", "value": 1 },
            { "source": "Prouvaire", "target": "Enjolras", "value": 4 },
            { "source": "Prouvaire", "target": "Combeferre", "value": 2 },
            { "source": "Feuilly", "target": "Gavroche", "value": 2 },
            { "source": "Feuilly", "target": "Enjolras", "value": 6 },
            { "source": "Feuilly", "target": "Prouvaire", "value": 2 },
            { "source": "Feuilly", "target": "Combeferre", "value": 5 },
            { "source": "Feuilly", "target": "Mabeuf", "value": 1 },
            { "source": "Feuilly", "target": "Marius", "value": 1 },
            { "source": "Courfeyrac", "target": "Marius", "value": 9 },
            { "source": "Courfeyrac", "target": "Enjolras", "value": 17 },
            { "source": "Courfeyrac", "target": "Combeferre", "value": 13 },
            { "source": "Courfeyrac", "target": "Gavroche", "value": 7 },
            { "source": "Courfeyrac", "target": "Mabeuf", "value": 2 },
            { "source": "Courfeyrac", "target": "Eponine", "value": 1 },
            { "source": "Courfeyrac", "target": "Feuilly", "value": 6 },
            { "source": "Courfeyrac", "target": "Prouvaire", "value": 3 },
            { "source": "Bahorel", "target": "Combeferre", "value": 5 },
            { "source": "Bahorel", "target": "Gavroche", "value": 5 },
            { "source": "Bahorel", "target": "Courfeyrac", "value": 6 },
            { "source": "Bahorel", "target": "Mabeuf", "value": 2 },
            { "source": "Bahorel", "target": "Enjolras", "value": 4 },
            { "source": "Bahorel", "target": "Feuilly", "value": 3 },
            { "source": "Bahorel", "target": "Prouvaire", "value": 2 },
            { "source": "Bahorel", "target": "Marius", "value": 1 },
            { "source": "Bossuet", "target": "Marius", "value": 5 },
            { "source": "Bossuet", "target": "Courfeyrac", "value": 12 },
            { "source": "Bossuet", "target": "Gavroche", "value": 5 },
            { "source": "Bossuet", "target": "Bahorel", "value": 4 },
            { "source": "Bossuet", "target": "Enjolras", "value": 10 },
            { "source": "Bossuet", "target": "Feuilly", "value": 6 },
            { "source": "Bossuet", "target": "Prouvaire", "value": 2 },
            { "source": "Bossuet", "target": "Combeferre", "value": 9 },
            { "source": "Bossuet", "target": "Mabeuf", "value": 1 },
            { "source": "Bossuet", "target": "Valjean", "value": 1 },
            { "source": "Joly", "target": "Bahorel", "value": 5 },
            { "source": "Joly", "target": "Bossuet", "value": 7 },
            { "source": "Joly", "target": "Gavroche", "value": 3 },
            { "source": "Joly", "target": "Courfeyrac", "value": 5 },
            { "source": "Joly", "target": "Enjolras", "value": 5 },
            { "source": "Joly", "target": "Feuilly", "value": 5 },
            { "source": "Joly", "target": "Prouvaire", "value": 2 },
            { "source": "Joly", "target": "Combeferre", "value": 5 },
            { "source": "Joly", "target": "Mabeuf", "value": 1 },
            { "source": "Joly", "target": "Marius", "value": 2 },
            { "source": "Grantaire", "target": "Bossuet", "value": 3 },
            { "source": "Grantaire", "target": "Enjolras", "value": 3 },
            { "source": "Grantaire", "target": "Combeferre", "value": 1 },
            { "source": "Grantaire", "target": "Courfeyrac", "value": 2 },
            { "source": "Grantaire", "target": "Joly", "value": 2 },
            { "source": "Grantaire", "target": "Gavroche", "value": 1 },
            { "source": "Grantaire", "target": "Bahorel", "value": 1 },
            { "source": "Grantaire", "target": "Feuilly", "value": 1 },
            { "source": "Grantaire", "target": "Prouvaire", "value": 1 },
            { "source": "MotherPlutarch", "target": "Mabeuf", "value": 3 },
            { "source": "Gueulemer", "target": "Thenardier", "value": 5 },
            { "source": "Gueulemer", "target": "Valjean", "value": 1 },
            { "source": "Gueulemer", "target": "Mme.Thenardier", "value": 1 },
            { "source": "Gueulemer", "target": "Javert", "value": 1 },
            { "source": "Gueulemer", "target": "Gavroche", "value": 1 },
            { "source": "Gueulemer", "target": "Eponine", "value": 1 },
            { "source": "Babet", "target": "Thenardier", "value": 6 },
            { "source": "Babet", "target": "Gueulemer", "value": 6 },
            { "source": "Babet", "target": "Valjean", "value": 1 },
            { "source": "Babet", "target": "Mme.Thenardier", "value": 1 },
            { "source": "Babet", "target": "Javert", "value": 2 },
            { "source": "Babet", "target": "Gavroche", "value": 1 },
            { "source": "Babet", "target": "Eponine", "value": 1 },
            { "source": "Claquesous", "target": "Thenardier", "value": 4 },
            { "source": "Claquesous", "target": "Babet", "value": 4 },
            { "source": "Claquesous", "target": "Gueulemer", "value": 4 },
            { "source": "Claquesous", "target": "Valjean", "value": 1 },
            { "source": "Claquesous", "target": "Mme.Thenardier", "value": 1 },
            { "source": "Claquesous", "target": "Javert", "value": 1 },
            { "source": "Claquesous", "target": "Eponine", "value": 1 },
            { "source": "Claquesous", "target": "Enjolras", "value": 1 },
            { "source": "Montparnasse", "target": "Javert", "value": 1 },
            { "source": "Montparnasse", "target": "Babet", "value": 2 },
            { "source": "Montparnasse", "target": "Gueulemer", "value": 2 },
            { "source": "Montparnasse", "target": "Claquesous", "value": 2 },
            { "source": "Montparnasse", "target": "Valjean", "value": 1 },
            { "source": "Montparnasse", "target": "Gavroche", "value": 1 },
            { "source": "Montparnasse", "target": "Eponine", "value": 1 },
            { "source": "Montparnasse", "target": "Thenardier", "value": 1 },
            { "source": "Toussaint", "target": "Cosette", "value": 2 },
            { "source": "Toussaint", "target": "Javert", "value": 1 },
            { "source": "Toussaint", "target": "Valjean", "value": 1 },
            { "source": "Child1", "target": "Gavroche", "value": 2 },
            { "source": "Child2", "target": "Gavroche", "value": 2 },
            { "source": "Child2", "target": "Child1", "value": 3 },
            { "source": "Brujon", "target": "Babet", "value": 3 },
            { "source": "Brujon", "target": "Gueulemer", "value": 3 },
            { "source": "Brujon", "target": "Thenardier", "value": 3 },
            { "source": "Brujon", "target": "Gavroche", "value": 1 },
            { "source": "Brujon", "target": "Eponine", "value": 1 },
            { "source": "Brujon", "target": "Claquesous", "value": 1 },
            { "source": "Brujon", "target": "Montparnasse", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Bossuet", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Joly", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Grantaire", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Bahorel", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Courfeyrac", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Gavroche", "value": 1 },
            { "source": "Mme.Hucheloup", "target": "Enjolras", "value": 1 }
        ]
    };

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)