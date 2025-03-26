(function (global, factory) {
    if (typeof exports === "object" && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        global.vizualy = { 'utility': factory() };
    }
}(this, function () {
    class Utility {

        constructor() { }

        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        handleException(...args) {
            if (!args || !args.length)
                return;
            let result = {};
            let funcArgs = args.slice(2);
            try {
                result = args[1].apply(args[0], funcArgs);
            } catch(error) {
                console.error(error);
                result.isExceptionOccurred = error;
            }
            return result;
        }


        unifyObject(arryOfObj, isEmptyCheckRequired, isNotDeepCopy) {
            const unifiedObject = {};
            const self = this;
            arryOfObj.forEach((elemObj) => {
                if (!isNotDeepCopy) {
                    elemObj = self.deepCopyObject(elemObj);
                }
                if (typeof elemObj === "object") {
                    for (let attrName in elemObj) {
                        if (!isEmptyCheckRequired || (isEmptyCheckRequired && elemObj[attrName])) {
                            if (unifiedObject[attrName] && typeof unifiedObject[attrName] === "object" && !Array.isArray(unifiedObject[attrName])) {
                                unifiedObject[attrName] = this.unifyObject([unifiedObject[attrName], elemObj[attrName]], isEmptyCheckRequired, true);
                            } else {
                                unifiedObject[attrName] = elemObj[attrName];
                            }
                        }
                    }
                }
            });
            return unifiedObject;
        }

        // Make a deep copy/clone of the object
        deepCopyObject(source, destination, maxDepth) {
            const self = this;
            let stackSource = [];
            let stackDest = [];
            maxDepth = self.isValidObjectMaxDepth(maxDepth) ? maxDepth : NaN;

            if (destination) {
                if (source === destination) {
                    console.error('cpi', 'Can\'t copy! Source and destination are identical.');
                }

                // Empty the destination object
                if (self.isArray(destination)) {
                    destination.length = 0;
                } else {
                    self.forEach(destination, function (value, key) {
                        delete destination[key];
                    });
                }

                stackSource.push(source);
                stackDest.push(destination);
                return copyRecurse(source, destination, maxDepth);
            }

            return copyElement(source, maxDepth);

            function copyRecurse(source, destination, maxDepth) {
                maxDepth--;
                if (maxDepth < 0) {
                    return '...';
                }
                let key;
                if (self.isArray(source)) {
                    for (let i = 0, ii = source.length; i < ii; i++) {
                        destination.push(copyElement(source[i], maxDepth));
                    }
                } else if (self.isBlankObject(source)) {
                    // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                    for (key in source) {
                        destination[key] = copyElement(source[key], maxDepth);
                    }
                } else if (source && typeof source.hasOwnProperty === 'function') {
                    // Slow path, which must rely on hasOwnProperty
                    for (key in source) {
                        if (source.hasOwnProperty(key)) {
                            destination[key] = copyElement(source[key], maxDepth);
                        }
                    }
                } else {
                    // Slowest path --- hasOwnProperty can't be called as a method
                    for (key in source) {
                        if (hasOwnProperty.call(source, key)) {
                            destination[key] = copyElement(source[key], maxDepth);
                        }
                    }
                }
                return destination;
            }

            function copyElement(source, maxDepth) {
                // Simple values
                if (!self.isObject(source)) {
                    return source;
                }

                // Already copied values
                let index = stackSource.indexOf(source);
                if (index !== -1) {
                    return stackDest[index];
                }

                if (self.isWindow(source)) {
                    console.error('cpws', 'Can\'t copy! Making copies of Window instance is not supported.');
                }

                let needsRecurse = false;
                let destination = copyType(source);

                if (destination === undefined) {
                    destination = self.isArray(source) ? [] : Object.create(Object.getPrototypeOf(source));
                    needsRecurse = true;
                }

                stackSource.push(source);
                stackDest.push(destination);

                return needsRecurse ? copyRecurse(source, destination, maxDepth) : destination;
            }

            function copyType(source) {
                switch (toString.call(source)) {
                    case '[object Int8Array]':
                    case '[object Int16Array]':
                    case '[object Int32Array]':
                    case '[object Float32Array]':
                    case '[object Float64Array]':
                    case '[object Uint8Array]':
                    case '[object Uint8ClampedArray]':
                    case '[object Uint16Array]':
                    case '[object Uint32Array]':
                        return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

                    case '[object ArrayBuffer]':
                        // Support: IE10
                        if (!source.slice) {
                            // If we're in self case we know the environment supports ArrayBuffer
                            /* eslint-disable no-undef */
                            let copied = new ArrayBuffer(source.byteLength);
                            new Uint8Array(copied).set(new Uint8Array(source));
                            /* eslint-enable */
                            return copied;
                        }
                        return source.slice(0);

                    case '[object Boolean]':
                    case '[object Number]':
                    case '[object String]':
                    case '[object Date]':
                        return new source.constructor(source.valueOf());

                    case '[object RegExp]':
                        var re = new RegExp(source.source, source.toString().match(/[^/]*$/)[0]);
                        re.lastIndex = source.lastIndex;
                        return re;

                    case '[object Blob]':
                        return new source.constructor([source], { type: source.type });
                }

                if (self.isFunction(source.cloneNode)) {
                    return source.cloneNode(true);
                }
            }
        }

        isValidObjectMaxDepth(maxDepth) {
            const self = this;
            return self.isNumber(maxDepth) && maxDepth > 0;
        }

        isNumber(value) {
            return typeof value === 'number';
        }

        isArray(arr) {
            return Array.isArray(arr) || arr instanceof Array;
        }

        forEach(obj, iterator, context) {
            let key, length;
            const self = this;
            if (obj) {
                if (self.isFunction(obj)) {
                    for (key in obj) {
                        if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                } else if (self.isArray(obj) || self.isArrayLike(obj)) {
                    let isPrimitive = typeof obj !== 'object';
                    for (key = 0, length = obj.length; key < length; key++) {
                        if (isPrimitive || key in obj) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                } else if (obj.forEach && obj.forEach !== forEach) {
                    obj.forEach(iterator, context, obj);
                } else if (self.isBlankObject(obj)) {
                    // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                    for (key in obj) {
                        iterator.call(context, obj[key], key, obj);
                    }
                } else if (typeof obj.hasOwnProperty === 'function') {
                    // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                } else {
                    // Slow path for objects which do not have a method `hasOwnProperty`
                    for (key in obj) {
                        if (hasOwnProperty.call(obj, key)) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }
            }
            return obj;
        }

        isFunction(value) {
            return typeof value === 'function';
        }

        isArrayLike(obj) {
            const self = this;
            // `null`, `undefined` and `window` are not array-like
            if (obj == null || self.isWindow(obj)) return false;

            // arrays, strings and jQuery/jqLite objects are array like
            // * jqLite is either the jQuery or jqLite constructor function
            // * we have to check the existence of jqLite first as self method is called
            //   via the forEach method when constructing the jqLite object in the first place
            if (self.isArray(obj) || self.isString(obj)) return true;

            // Support: iOS 8.2 (not reproducible in simulator)
            // "length" in obj used to prevent JIT error (gh-11508)
            let length = 'length' in Object(obj) && obj.length;

            // NodeList objects (with `item` method) and
            // other objects with suitable length characteristics are array-like
            return self.isNumber(length) && (length >= 0 && (length - 1) in obj || typeof obj.item === 'function');

        }

        isBlankObject(value) {
            return value !== null && typeof value === 'object' && !Object.getPrototypeOf(value);
        }

        isWindow(obj) {
            return obj && obj.window === obj;
        }

        isObject(value) {
            return value !== null && typeof value === 'object';
        }

        isString(value) {
            return typeof value === 'string';
        }

        isDataEmpty(data) {
            if (!data || (Object.keys(data).length == 0) || (Array.isArray(data) && Object.keys(data[0]).length == 0) || data.length == 0 || typeof data !== 'object') {
                return true;
            }
            return false;
        }
    }
    return new Utility();
}));