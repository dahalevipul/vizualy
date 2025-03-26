(function (global, factory) {
    if (typeof exports === "object" && typeof module !== 'undefined') {
        module.exports = factory(require('d3'));
    } else if (typeof define === "function" && define.amd) {
        define(['../libs/d3.v6.min.js'], factory);
    } else {
        if (global.vizualy) {
            global.vizualy.Observer = factory(d3);
        } else {
            console.error("Library(Vizualy) object is missing. Please check the order of scripts.");
        }
    }
}(this, function () {
    class Subject {
        constructor() { }

        //Registers given actions to given event(eventId) for element(obj)
        register(obj, eventId, actionArray) {
            if (!obj[eventId]) {
                obj[eventId] = [];
            }
            actionArray.forEach((item) => {
                obj[eventId].push(item);
            });
        }
        //Clears all methods for given event(eventId) of element(obj)
        unRegister(obj, eventId) {
            if (obj[eventId]) {
                obj[eventId] = null;
            }
        }
        //Call all actions/methods/callbacks registered to given eventId for element(obj) and passes associated data(data) to callback
        notify(obj, eventId, data, elem, event) {
            if (!obj[eventId] || obj[eventId].length < 1) {
                return;
            }
            // Iterate the handlers and notify them on given element object
            obj[eventId].forEach(function (item) {
                item(data, elem, event);
            });
        }
    }

    class Observer extends Subject {
        constructor() {
            super();
        }
        attacheHandlersToEvent() {
            const self = this;
            return {
                "mouseMove": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'mouseMoveActions');
                    }
                    self.register(obj, 'mouseMoveActions', fnArry);
                    return obj;
                },
                "mouseEnter": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'mouseEnterActions');
                    }
                    self.register(obj, 'mouseEnterActions', fnArry);
                    return obj;
                },
                "mouseOut": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'mouseOutActions');
                    }
                    self.register(obj, 'mouseOutActions', fnArry);
                    return obj;
                },
                "mouseOver": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'mouseOverActions');
                    }
                    self.register(obj, 'mouseOverActions', fnArry);
                    return obj;
                },
                "click": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'clickActions');
                    }
                    self.register(obj, 'clickActions', fnArry);
                    return obj;
                },
                "dragStart": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'dragStartActions');
                    }
                    self.register(obj, 'dragStartActions', fnArry);
                    return obj;
                },
                "drag": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'dragActions');
                    }
                    self.register(obj, 'dragActions', fnArry);
                    return obj;
                },
                "dragEnd": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'dragEndActions');
                    }
                    self.register(obj, 'dragEndActions', fnArry);
                    return obj;
                },
                "dbClick": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'dbClickActions');
                    }
                    self.register(obj, 'dbClickActions', fnArry);
                    return obj;
                },
                "contextMenu": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'contextMenuActions');
                    }
                    self.register(obj, 'contextMenuActions', fnArry);
                    return obj;
                },
                "zoom": function (obj, fnArry, clear) {
                    if (clear) {
                        //Remove already attached ALL handlers of event for an element.
                        self.unRegister(obj, 'zoomActions');
                    }
                    self.register(obj, 'zoomActions', fnArry);
                    return obj;
                },
            };

        }
        //Prepare element information and contains the functionality to register the handlers to different events for given element identifier .
        exposeElement(elementInfomationObj, elementIdentifier, element) {
            var self = this;
            if (!elementInfomationObj[elementIdentifier]) {
                elementInfomationObj[elementIdentifier] = {
                    "elementIdentifier": elementIdentifier,
                    "element": element,
                    "on": function (eventId, fnArry, clear) {
                        self.attacheHandlersToEvent()[eventId](this, fnArry, clear);
                    }
                };
            } else {
                elementInfomationObj[elementIdentifier].element = element;
            }
            self.activateRealEventsOnElement(elementInfomationObj, elementIdentifier, element);
        }

        activateRealEventsOnElement(elementInfomationObj, elementIdentifier, element) {
            const self = this;
            element
                .on("mousemove", function (event, d) {
                    self.notify(elementInfomationObj[elementIdentifier], 'mouseMoveActions', d, this, event);
                })
                .on("mouseenter", function (event, d) {
                    self.notify(elementInfomationObj[elementIdentifier], 'mouseEnterActions', d, this, event);
                })
                .on("mouseout", function (event, d) {
                    self.notify(elementInfomationObj[elementIdentifier], 'mouseOutActions', d, this, event);
                })
                .on("mouseover", function (event, d) {
                    self.notify(elementInfomationObj[elementIdentifier], 'mouseOverActions', d, this, event);
                })
                .on("click", function (event, d) {
                    self.notify(elementInfomationObj[elementIdentifier], 'clickActions', d, this, event);
                });
        }
    }
    return Observer;
}));