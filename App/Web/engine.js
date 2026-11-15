(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/immy/src/ListPatches.js
  var require_ListPatches = __commonJS({
    "node_modules/immy/src/ListPatches.js"(exports) {
      function Add(index, value, _inverse) {
        this.index = index;
        this.value = value;
        this._inverse = _inverse;
      }
      Add.prototype.apply = function(array) {
        array.splice(this.index, 0, this.value);
      };
      Add.prototype.inverse = function() {
        if (!this._inverse) {
          this._inverse = new Remove(this.index, this.value, this);
        }
        return this._inverse;
      };
      Add.prototype.toPrimitives = function() {
        return [this];
      };
      Add.prototype.forEachPrimitive = function(cb) {
        cb(this);
      };
      exports.Add = Add;
      function Remove(index, value, _inverse) {
        this.index = index;
        this.value = value;
        this._inverse = _inverse;
      }
      Remove.prototype.apply = function(array) {
        array.splice(this.index, 1);
      };
      Remove.prototype.inverse = function() {
        if (!this._inverse) {
          this._inverse = new Add(this.index, this.value, this);
        }
        return this._inverse;
      };
      Remove.prototype.toPrimitives = function() {
        return [this];
      };
      Remove.prototype.forEachPrimitive = function(cb) {
        cb(this);
      };
      exports.Remove = Remove;
      function Sequence(patches, _inverse) {
        this.patches = patches;
        this._inverse = _inverse;
      }
      Sequence.prototype.apply = function(buffer) {
        var i;
        for (i = 0; i < this.patches.length; ++i) {
          this.patches[i].apply(buffer);
        }
      };
      Sequence.prototype.inverse = function() {
        if (!this._inverse) {
          var inverted = [];
          var i;
          for (i = this.patches.length - 1; i >= 0; --i) {
            inverted.push(this.patches[i].inverse());
          }
          this._inverse = new Sequence(inverted, this);
        }
        return this._inverse;
      };
      Sequence.prototype.toPrimitives = function() {
        var primitives = [];
        var i;
        for (i = 0; i < this.patches.length; ++i) {
          Array.prototype.push.apply(primitives, this.patches[i].toPrimitives());
        }
        return primitives;
      };
      Sequence.prototype.forEachPrimitive = function(cb) {
        var i;
        for (i = 0; i < this.patches.length; ++i) {
          this.patches[i].forEachPrimitive(cb);
        }
      };
      exports.Sequence = Sequence;
    }
  });

  // node_modules/immy/src/List.js
  var require_List = __commonJS({
    "node_modules/immy/src/List.js"(exports, module) {
      var ListPatches = require_ListPatches();
      function List(initBuffer) {
        if (initBuffer != null) {
          this.buffer = initBuffer.slice();
        } else {
          this.buffer = null;
        }
        this.patchSource = null;
        this.patch = null;
        this.root = {};
      }
      List.prototype.__getBuffer = function() {
        if (this.buffer) {
          return;
        }
        if (!this.patchSource) {
          this.buffer = [];
          return;
        }
        var source = this.patchSource;
        var targets = [this];
        while (source.patchSource) {
          targets.push(source);
          source = source.patchSource;
        }
        while (targets.length > 0) {
          var target = targets.pop();
          target.patch.apply(source.buffer);
          source.patchSource = target;
          source.patch = target.patch.inverse();
          target.buffer = source.buffer;
          source.buffer = null;
          target.patchSource = null;
          source = target;
        }
      };
      List.prototype.push = function(value) {
        if (!this.buffer) this.__getBuffer();
        var newList = new List();
        this.patchSource = newList;
        this.patch = new ListPatches.Remove(this.buffer.length, value);
        newList.buffer = this.buffer;
        this.buffer = null;
        newList.buffer.push(value);
        newList.root = this.root;
        return newList;
      };
      List.prototype.withValueAdded = function(index, value) {
        if (!this.buffer) this.__getBuffer();
        var newList = new List();
        this.patchSource = newList;
        this.patch = new ListPatches.Remove(index, value);
        newList.buffer = this.buffer;
        this.buffer = null;
        newList.buffer.splice(index, 0, value);
        newList.root = this.root;
        return newList;
      };
      List.prototype.withValueRemoved = function(index) {
        if (!this.buffer) this.__getBuffer();
        var newList = new List();
        this.patchSource = newList;
        this.patch = new ListPatches.Add(index, this.buffer[index]);
        newList.buffer = this.buffer;
        this.buffer = null;
        newList.buffer.splice(index, 1);
        newList.root = this.root;
        return newList;
      };
      List.prototype.pop = function() {
        if (!this.buffer) this.__getBuffer();
        var newList = new List();
        this.patchSource = newList;
        this.patch = new ListPatches.Add(this.buffer.length - 1, this.buffer[this.buffer.length - 1]);
        this.buffer.pop();
        newList.buffer = this.buffer;
        this.buffer = null;
        newList.root = this.root;
        return newList;
      };
      List.prototype.size = function() {
        if (!this.buffer) this.__getBuffer();
        return this.buffer.length;
      };
      List.prototype.get = function(index) {
        if (!this.buffer) this.__getBuffer();
        return this.buffer[index];
      };
      List.prototype.set = function(index, newValue) {
        if (!this.buffer) this.__getBuffer();
        var newList = new List();
        this.patchSource = newList;
        this.patch = new ListPatches.Sequence([
          new ListPatches.Remove(index, newValue),
          new ListPatches.Add(index, this.buffer[index])
        ]);
        newList.buffer = this.buffer;
        this.buffer = null;
        newList.buffer[index] = newValue;
        newList.root = this.root;
        return newList;
      };
      List.prototype.forEach = function(fn) {
        if (!this.buffer) this.__getBuffer();
        this.buffer.forEach(fn);
      };
      List.prototype.findIndex = function(pred) {
        if (!this.buffer) this.__getBuffer();
        return this.buffer.findIndex(pred);
      };
      List.prototype.findIndexWithBinarySearch = function(comparisonPred) {
        if (!this.buffer) this.__getBuffer();
        var minIndex = 0;
        var maxIndex = this.buffer.length - 1;
        var currentIndex;
        var currentElement;
        while (minIndex <= maxIndex) {
          currentIndex = (minIndex + maxIndex) / 2 | 0;
          currentElement = this.buffer[currentIndex];
          var res = comparisonPred(currentElement);
          if (res < 0) {
            minIndex = currentIndex + 1;
          } else if (res > 0) {
            maxIndex = currentIndex - 1;
          } else {
            while (currentIndex < this.buffer.length - 1 && comparisonPred(this.buffer[currentIndex + 1]) == 0) {
              ++currentIndex;
            }
            return currentIndex;
          }
        }
        return -1;
      };
      List.prototype.findInsertionIndexWithBinarySearch = function(comparisonPred) {
        if (!this.buffer) this.__getBuffer();
        if (this.buffer.length == 0) {
          return 0;
        }
        var minIndex = 0;
        var maxIndex = this.buffer.length - 1;
        var currentIndex;
        var currentElement;
        while (minIndex <= maxIndex) {
          currentIndex = (minIndex + maxIndex) / 2 | 0;
          currentElement = this.buffer[currentIndex];
          var res = comparisonPred(currentElement);
          if (res < 0) {
            minIndex = currentIndex + 1;
          } else if (res > 0) {
            maxIndex = currentIndex - 1;
          } else {
            while (currentIndex < this.buffer.length - 1 && comparisonPred(this.buffer[currentIndex + 1]) == 0) {
              ++currentIndex;
            }
            return currentIndex + 1;
          }
        }
        var res = comparisonPred(this.buffer[currentIndex]);
        if (res > 0) {
          return currentIndex;
        } else {
          return currentIndex + 1;
        }
      };
      List.prototype.withMutation = function(index, fn) {
        return this.set(index, fn(this.get(index)));
      };
      List.prototype.slice = function(begin, end) {
        if (begin === void 0 || begin === 0 && end === void 0) {
          return this;
        }
        if (!this.buffer) this.__getBuffer();
        var sliced = new List();
        sliced.buffer = this.buffer.slice(begin, end);
        return sliced;
      };
      List.prototype.splice = function(start, deleteCount) {
        var i;
        if (start === 0 && deleteCount === 0 && arguments.length === 2) {
          return this;
        }
        if (start === void 0) {
          start = 0;
        }
        var deletedItems = this.buffer.splice.apply(this.buffer, arguments);
        var patches = [];
        for (i = 2; i < arguments.length; ++i) {
          patches.push(new ListPatches.Remove(start, arguments[i]));
        }
        for (i = 0; i < deletedItems.length; ++i) {
          patches.push(new ListPatches.Add(start + i, deletedItems[i]));
        }
        var newList = new List();
        this.patchSource = newList;
        this.patch = new ListPatches.Sequence(patches);
        newList.buffer = this.buffer;
        this.buffer = null;
        newList.root = this.root;
        return newList;
      };
      List.prototype.compareTo = function(otherList, hints) {
        if (otherList.root == this.root) {
          if (otherList == this) {
            return new ListPatches.Sequence([]);
          }
          if (this.buffer) {
            return walk(otherList);
          } else if (otherList.buffer) {
            return walk(this).inverse();
          } else {
            if (!this.buffer) this.__getBuffer();
            return walk(otherList);
          }
        } else {
          if (!this.buffer) this.__getBuffer();
          otherList.__getBuffer();
          if (hints && hints.ordered) {
            return orderedDiff(this.buffer, otherList.buffer, hints.comparison);
          }
          return diff(this.buffer, otherList.buffer);
        }
      };
      function walk(src) {
        var patches = [];
        var curr = src;
        while (!curr.buffer) {
          patches.push(curr.patch);
          curr = curr.patchSource;
        }
        patches.reverse();
        if (patches.length == 1) {
          return patches[0];
        } else {
          return new ListPatches.Sequence(patches);
        }
      }
      function diff(fromArr, to) {
        var i;
        var patches = [];
        for (i = fromArr.length - 1; i >= 0; --i) {
          patches.push(new ListPatches.Remove(i, fromArr[i]));
        }
        for (i = 0; i < to.length; ++i) {
          patches.push(new ListPatches.Add(i, to[i]));
        }
        return new ListPatches.Sequence(patches);
      }
      function orderedDiff(A, B, comparison) {
        var patches = [];
        var i, j, k;
        count = 0;
        for (i = 0, j = 0, k = 0; i < A.length && j < B.length; ++k) {
          var res = comparison(A[i], B[j]);
          if (res == null) {
            patches.push(new ListPatches.Remove(k, A[i]));
            patches.push(new ListPatches.Add(k, B[j]));
            ++i;
            ++j;
          } else if (res == 0) {
            ++i;
            ++j;
          } else if (res < 0) {
            patches.push(new ListPatches.Remove(k, A[i]));
            ++i;
            --k;
          } else {
            patches.push(new ListPatches.Add(k, B[j]));
            ++j;
          }
        }
        if (i == A.length && j != B.length) {
          while (j < B.length) {
            patches.push(new ListPatches.Add(k, B[j]));
            ++j;
            ++k;
          }
        } else if (i != A.length && j == B.length) {
          while (i < A.length) {
            patches.push(new ListPatches.Remove(k, A[i]));
            ++i;
          }
        }
        return new ListPatches.Sequence(patches);
      }
      List.prototype.withPatchApplied = function(patch) {
        if (!this.buffer) this.__getBuffer();
        var newList = new List();
        this.patchSource = newList;
        this.patch = patch.inverse();
        newList.buffer = this.buffer;
        this.buffer = null;
        patch.apply(newList.buffer);
        return newList;
      };
      module.exports = List;
    }
  });

  // node_modules/immy/src/MapPatches.js
  var require_MapPatches = __commonJS({
    "node_modules/immy/src/MapPatches.js"(exports) {
      function SetPatch(key, oldValue, newValue) {
        this.key = key;
        this.oldValue = oldValue;
        this.newValue = newValue;
      }
      SetPatch.prototype.apply = function(map) {
        if (this.newValue === void 0) {
          map.delete(this.key);
        } else {
          map.set(this.key, this.newValue);
        }
      };
      SetPatch.prototype.inverse = function() {
        return new SetPatch(this.key, this.newValue, this.oldValue);
      };
      SetPatch.prototype.toPrimitives = function() {
        return [this];
      };
      SetPatch.prototype.forEachPrimitive = function(cb) {
        cb(this);
      };
      exports.Set = SetPatch;
      function Sequence(patches) {
        this.patches = patches;
      }
      Sequence.prototype.apply = function(map) {
        var i;
        for (i = 0; i < this.patches.length; ++i) {
          this.patches[i].apply(map);
        }
      };
      Sequence.prototype.inverse = function() {
        var inverted = [];
        var i;
        for (i = this.patches.length - 1; i >= 0; --i) {
          inverted.push(this.patches[i].inverse());
        }
        return new Sequence(inverted);
      };
      Sequence.prototype.toPrimitives = function() {
        var primitives = [];
        var i;
        for (i = 0; i < this.patches.length; ++i) {
          Array.prototype.push.apply(primitives, this.patches[i].toPrimitives());
        }
        return primitives;
      };
      Sequence.prototype.forEachPrimitive = function(cb) {
        var i;
        for (i = 0; i < this.patches.length; ++i) {
          this.patches[i].forEachPrimitive(cb);
        }
      };
      exports.Sequence = Sequence;
    }
  });

  // node_modules/immy/src/ImmyMap.js
  var require_ImmyMap = __commonJS({
    "node_modules/immy/src/ImmyMap.js"(exports, module) {
      var MapPatches = require_MapPatches();
      function ImmyMap(initMap) {
        if (initMap) {
          this.map = initMap;
        } else {
          this.map = null;
        }
        this.patchSource = null;
        this.patch = null;
        this.root = {};
      }
      ImmyMap.prototype.__getMap = function() {
        if (this.map) {
          return;
        }
        if (!this.patchSource) {
          this.map = /* @__PURE__ */ new Map();
          return;
        }
        var source = this.patchSource;
        var targets = [this];
        while (source.patchSource) {
          targets.push(source);
          source = source.patchSource;
        }
        while (targets.length > 0) {
          var target = targets.pop();
          target.patch.apply(source.map);
          source.patchSource = target;
          source.patch = target.patch.inverse();
          target.map = source.map;
          source.map = null;
          target.patchSource = null;
          source = target;
        }
      };
      ImmyMap.prototype.get = function(key) {
        this.__getMap();
        return this.map.get(key);
      };
      ImmyMap.prototype.withKeySetToValue = function(key, value) {
        this.__getMap();
        var newMap = new ImmyMap();
        newMap.map = this.map;
        this.map = null;
        this.patchSource = newMap;
        this.patch = new MapPatches.Set(key, value, newMap.map.get(key));
        newMap.map.set(key, value);
        return newMap;
      };
      ImmyMap.prototype.withKeyDeleted = function(key) {
        this.__getMap();
        var newMap = new ImmyMap();
        newMap.map = this.map;
        this.map = null;
        this.patchSource = newMap;
        this.patch = new MapPatches.Set(key, void 0, newMap.get(key));
        newMap.map.delete(key);
        return newMap;
      };
      ImmyMap.prototype.forEach = function(cb) {
        this.__getMap();
        this.map.forEach(cb);
      };
      ImmyMap.prototype.size = function() {
        this.__getMap();
        return this.map.size;
      };
      ImmyMap.prototype.has = function(key) {
        this.__getMap();
        return this.map.has(key);
      };
      module.exports = ImmyMap;
    }
  });

  // node_modules/immy/src/immy.js
  var require_immy = __commonJS({
    "node_modules/immy/src/immy.js"(exports, module) {
      module.exports = {
        List: require_List(),
        ListPatches: require_ListPatches(),
        Map: require_ImmyMap(),
        MapPatches: require_MapPatches()
      };
    }
  });

  // node_modules/lodash/_listCacheClear.js
  var require_listCacheClear = __commonJS({
    "node_modules/lodash/_listCacheClear.js"(exports, module) {
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      module.exports = listCacheClear;
    }
  });

  // node_modules/lodash/eq.js
  var require_eq = __commonJS({
    "node_modules/lodash/eq.js"(exports, module) {
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      module.exports = eq;
    }
  });

  // node_modules/lodash/_assocIndexOf.js
  var require_assocIndexOf = __commonJS({
    "node_modules/lodash/_assocIndexOf.js"(exports, module) {
      var eq = require_eq();
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      module.exports = assocIndexOf;
    }
  });

  // node_modules/lodash/_listCacheDelete.js
  var require_listCacheDelete = __commonJS({
    "node_modules/lodash/_listCacheDelete.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      var arrayProto = Array.prototype;
      var splice = arrayProto.splice;
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      module.exports = listCacheDelete;
    }
  });

  // node_modules/lodash/_listCacheGet.js
  var require_listCacheGet = __commonJS({
    "node_modules/lodash/_listCacheGet.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? void 0 : data[index][1];
      }
      module.exports = listCacheGet;
    }
  });

  // node_modules/lodash/_listCacheHas.js
  var require_listCacheHas = __commonJS({
    "node_modules/lodash/_listCacheHas.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      module.exports = listCacheHas;
    }
  });

  // node_modules/lodash/_listCacheSet.js
  var require_listCacheSet = __commonJS({
    "node_modules/lodash/_listCacheSet.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      module.exports = listCacheSet;
    }
  });

  // node_modules/lodash/_ListCache.js
  var require_ListCache = __commonJS({
    "node_modules/lodash/_ListCache.js"(exports, module) {
      var listCacheClear = require_listCacheClear();
      var listCacheDelete = require_listCacheDelete();
      var listCacheGet = require_listCacheGet();
      var listCacheHas = require_listCacheHas();
      var listCacheSet = require_listCacheSet();
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      module.exports = ListCache;
    }
  });

  // node_modules/lodash/_stackClear.js
  var require_stackClear = __commonJS({
    "node_modules/lodash/_stackClear.js"(exports, module) {
      var ListCache = require_ListCache();
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      module.exports = stackClear;
    }
  });

  // node_modules/lodash/_stackDelete.js
  var require_stackDelete = __commonJS({
    "node_modules/lodash/_stackDelete.js"(exports, module) {
      function stackDelete(key) {
        var data = this.__data__, result = data["delete"](key);
        this.size = data.size;
        return result;
      }
      module.exports = stackDelete;
    }
  });

  // node_modules/lodash/_stackGet.js
  var require_stackGet = __commonJS({
    "node_modules/lodash/_stackGet.js"(exports, module) {
      function stackGet(key) {
        return this.__data__.get(key);
      }
      module.exports = stackGet;
    }
  });

  // node_modules/lodash/_stackHas.js
  var require_stackHas = __commonJS({
    "node_modules/lodash/_stackHas.js"(exports, module) {
      function stackHas(key) {
        return this.__data__.has(key);
      }
      module.exports = stackHas;
    }
  });

  // node_modules/lodash/_freeGlobal.js
  var require_freeGlobal = __commonJS({
    "node_modules/lodash/_freeGlobal.js"(exports, module) {
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      module.exports = freeGlobal;
    }
  });

  // node_modules/lodash/_root.js
  var require_root = __commonJS({
    "node_modules/lodash/_root.js"(exports, module) {
      var freeGlobal = require_freeGlobal();
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      module.exports = root;
    }
  });

  // node_modules/lodash/_Symbol.js
  var require_Symbol = __commonJS({
    "node_modules/lodash/_Symbol.js"(exports, module) {
      var root = require_root();
      var Symbol2 = root.Symbol;
      module.exports = Symbol2;
    }
  });

  // node_modules/lodash/_getRawTag.js
  var require_getRawTag = __commonJS({
    "node_modules/lodash/_getRawTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var nativeObjectToString = objectProto.toString;
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = void 0;
          var unmasked = true;
        } catch (e) {
        }
        var result = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result;
      }
      module.exports = getRawTag;
    }
  });

  // node_modules/lodash/_objectToString.js
  var require_objectToString = __commonJS({
    "node_modules/lodash/_objectToString.js"(exports, module) {
      var objectProto = Object.prototype;
      var nativeObjectToString = objectProto.toString;
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      module.exports = objectToString;
    }
  });

  // node_modules/lodash/_baseGetTag.js
  var require_baseGetTag = __commonJS({
    "node_modules/lodash/_baseGetTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var getRawTag = require_getRawTag();
      var objectToString = require_objectToString();
      var nullTag = "[object Null]";
      var undefinedTag = "[object Undefined]";
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function baseGetTag(value) {
        if (value == null) {
          return value === void 0 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
      }
      module.exports = baseGetTag;
    }
  });

  // node_modules/lodash/isObject.js
  var require_isObject = __commonJS({
    "node_modules/lodash/isObject.js"(exports, module) {
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      module.exports = isObject;
    }
  });

  // node_modules/lodash/isFunction.js
  var require_isFunction = __commonJS({
    "node_modules/lodash/isFunction.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObject = require_isObject();
      var asyncTag = "[object AsyncFunction]";
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var proxyTag = "[object Proxy]";
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      module.exports = isFunction;
    }
  });

  // node_modules/lodash/_coreJsData.js
  var require_coreJsData = __commonJS({
    "node_modules/lodash/_coreJsData.js"(exports, module) {
      var root = require_root();
      var coreJsData = root["__core-js_shared__"];
      module.exports = coreJsData;
    }
  });

  // node_modules/lodash/_isMasked.js
  var require_isMasked = __commonJS({
    "node_modules/lodash/_isMasked.js"(exports, module) {
      var coreJsData = require_coreJsData();
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      })();
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      module.exports = isMasked;
    }
  });

  // node_modules/lodash/_toSource.js
  var require_toSource = __commonJS({
    "node_modules/lodash/_toSource.js"(exports, module) {
      var funcProto = Function.prototype;
      var funcToString = funcProto.toString;
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      module.exports = toSource;
    }
  });

  // node_modules/lodash/_baseIsNative.js
  var require_baseIsNative = __commonJS({
    "node_modules/lodash/_baseIsNative.js"(exports, module) {
      var isFunction = require_isFunction();
      var isMasked = require_isMasked();
      var isObject = require_isObject();
      var toSource = require_toSource();
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      var funcProto = Function.prototype;
      var objectProto = Object.prototype;
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var reIsNative = RegExp(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      module.exports = baseIsNative;
    }
  });

  // node_modules/lodash/_getValue.js
  var require_getValue = __commonJS({
    "node_modules/lodash/_getValue.js"(exports, module) {
      function getValue(object, key) {
        return object == null ? void 0 : object[key];
      }
      module.exports = getValue;
    }
  });

  // node_modules/lodash/_getNative.js
  var require_getNative = __commonJS({
    "node_modules/lodash/_getNative.js"(exports, module) {
      var baseIsNative = require_baseIsNative();
      var getValue = require_getValue();
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : void 0;
      }
      module.exports = getNative;
    }
  });

  // node_modules/lodash/_Map.js
  var require_Map = __commonJS({
    "node_modules/lodash/_Map.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Map2 = getNative(root, "Map");
      module.exports = Map2;
    }
  });

  // node_modules/lodash/_nativeCreate.js
  var require_nativeCreate = __commonJS({
    "node_modules/lodash/_nativeCreate.js"(exports, module) {
      var getNative = require_getNative();
      var nativeCreate = getNative(Object, "create");
      module.exports = nativeCreate;
    }
  });

  // node_modules/lodash/_hashClear.js
  var require_hashClear = __commonJS({
    "node_modules/lodash/_hashClear.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      module.exports = hashClear;
    }
  });

  // node_modules/lodash/_hashDelete.js
  var require_hashDelete = __commonJS({
    "node_modules/lodash/_hashDelete.js"(exports, module) {
      function hashDelete(key) {
        var result = this.has(key) && delete this.__data__[key];
        this.size -= result ? 1 : 0;
        return result;
      }
      module.exports = hashDelete;
    }
  });

  // node_modules/lodash/_hashGet.js
  var require_hashGet = __commonJS({
    "node_modules/lodash/_hashGet.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? void 0 : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : void 0;
      }
      module.exports = hashGet;
    }
  });

  // node_modules/lodash/_hashHas.js
  var require_hashHas = __commonJS({
    "node_modules/lodash/_hashHas.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
      }
      module.exports = hashHas;
    }
  });

  // node_modules/lodash/_hashSet.js
  var require_hashSet = __commonJS({
    "node_modules/lodash/_hashSet.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
        return this;
      }
      module.exports = hashSet;
    }
  });

  // node_modules/lodash/_Hash.js
  var require_Hash = __commonJS({
    "node_modules/lodash/_Hash.js"(exports, module) {
      var hashClear = require_hashClear();
      var hashDelete = require_hashDelete();
      var hashGet = require_hashGet();
      var hashHas = require_hashHas();
      var hashSet = require_hashSet();
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      module.exports = Hash;
    }
  });

  // node_modules/lodash/_mapCacheClear.js
  var require_mapCacheClear = __commonJS({
    "node_modules/lodash/_mapCacheClear.js"(exports, module) {
      var Hash = require_Hash();
      var ListCache = require_ListCache();
      var Map2 = require_Map();
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map2 || ListCache)(),
          "string": new Hash()
        };
      }
      module.exports = mapCacheClear;
    }
  });

  // node_modules/lodash/_isKeyable.js
  var require_isKeyable = __commonJS({
    "node_modules/lodash/_isKeyable.js"(exports, module) {
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      module.exports = isKeyable;
    }
  });

  // node_modules/lodash/_getMapData.js
  var require_getMapData = __commonJS({
    "node_modules/lodash/_getMapData.js"(exports, module) {
      var isKeyable = require_isKeyable();
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      module.exports = getMapData;
    }
  });

  // node_modules/lodash/_mapCacheDelete.js
  var require_mapCacheDelete = __commonJS({
    "node_modules/lodash/_mapCacheDelete.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheDelete(key) {
        var result = getMapData(this, key)["delete"](key);
        this.size -= result ? 1 : 0;
        return result;
      }
      module.exports = mapCacheDelete;
    }
  });

  // node_modules/lodash/_mapCacheGet.js
  var require_mapCacheGet = __commonJS({
    "node_modules/lodash/_mapCacheGet.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      module.exports = mapCacheGet;
    }
  });

  // node_modules/lodash/_mapCacheHas.js
  var require_mapCacheHas = __commonJS({
    "node_modules/lodash/_mapCacheHas.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      module.exports = mapCacheHas;
    }
  });

  // node_modules/lodash/_mapCacheSet.js
  var require_mapCacheSet = __commonJS({
    "node_modules/lodash/_mapCacheSet.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size = data.size;
        data.set(key, value);
        this.size += data.size == size ? 0 : 1;
        return this;
      }
      module.exports = mapCacheSet;
    }
  });

  // node_modules/lodash/_MapCache.js
  var require_MapCache = __commonJS({
    "node_modules/lodash/_MapCache.js"(exports, module) {
      var mapCacheClear = require_mapCacheClear();
      var mapCacheDelete = require_mapCacheDelete();
      var mapCacheGet = require_mapCacheGet();
      var mapCacheHas = require_mapCacheHas();
      var mapCacheSet = require_mapCacheSet();
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      module.exports = MapCache;
    }
  });

  // node_modules/lodash/_stackSet.js
  var require_stackSet = __commonJS({
    "node_modules/lodash/_stackSet.js"(exports, module) {
      var ListCache = require_ListCache();
      var Map2 = require_Map();
      var MapCache = require_MapCache();
      var LARGE_ARRAY_SIZE = 200;
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      module.exports = stackSet;
    }
  });

  // node_modules/lodash/_Stack.js
  var require_Stack = __commonJS({
    "node_modules/lodash/_Stack.js"(exports, module) {
      var ListCache = require_ListCache();
      var stackClear = require_stackClear();
      var stackDelete = require_stackDelete();
      var stackGet = require_stackGet();
      var stackHas = require_stackHas();
      var stackSet = require_stackSet();
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      Stack.prototype.clear = stackClear;
      Stack.prototype["delete"] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      module.exports = Stack;
    }
  });

  // node_modules/lodash/_setCacheAdd.js
  var require_setCacheAdd = __commonJS({
    "node_modules/lodash/_setCacheAdd.js"(exports, module) {
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      module.exports = setCacheAdd;
    }
  });

  // node_modules/lodash/_setCacheHas.js
  var require_setCacheHas = __commonJS({
    "node_modules/lodash/_setCacheHas.js"(exports, module) {
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      module.exports = setCacheHas;
    }
  });

  // node_modules/lodash/_SetCache.js
  var require_SetCache = __commonJS({
    "node_modules/lodash/_SetCache.js"(exports, module) {
      var MapCache = require_MapCache();
      var setCacheAdd = require_setCacheAdd();
      var setCacheHas = require_setCacheHas();
      function SetCache(values) {
        var index = -1, length = values == null ? 0 : values.length;
        this.__data__ = new MapCache();
        while (++index < length) {
          this.add(values[index]);
        }
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      module.exports = SetCache;
    }
  });

  // node_modules/lodash/_arraySome.js
  var require_arraySome = __commonJS({
    "node_modules/lodash/_arraySome.js"(exports, module) {
      function arraySome(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (predicate(array[index], index, array)) {
            return true;
          }
        }
        return false;
      }
      module.exports = arraySome;
    }
  });

  // node_modules/lodash/_cacheHas.js
  var require_cacheHas = __commonJS({
    "node_modules/lodash/_cacheHas.js"(exports, module) {
      function cacheHas(cache, key) {
        return cache.has(key);
      }
      module.exports = cacheHas;
    }
  });

  // node_modules/lodash/_equalArrays.js
  var require_equalArrays = __commonJS({
    "node_modules/lodash/_equalArrays.js"(exports, module) {
      var SetCache = require_SetCache();
      var arraySome = require_arraySome();
      var cacheHas = require_cacheHas();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array;
        }
        var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
        stack.set(array, other);
        stack.set(other, array);
        while (++index < arrLength) {
          var arrValue = array[index], othValue = other[index];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
          }
          if (compared !== void 0) {
            if (compared) {
              continue;
            }
            result = false;
            break;
          }
          if (seen) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result = false;
            break;
          }
        }
        stack["delete"](array);
        stack["delete"](other);
        return result;
      }
      module.exports = equalArrays;
    }
  });

  // node_modules/lodash/_Uint8Array.js
  var require_Uint8Array = __commonJS({
    "node_modules/lodash/_Uint8Array.js"(exports, module) {
      var root = require_root();
      var Uint8Array2 = root.Uint8Array;
      module.exports = Uint8Array2;
    }
  });

  // node_modules/lodash/_mapToArray.js
  var require_mapToArray = __commonJS({
    "node_modules/lodash/_mapToArray.js"(exports, module) {
      function mapToArray(map) {
        var index = -1, result = Array(map.size);
        map.forEach(function(value, key) {
          result[++index] = [key, value];
        });
        return result;
      }
      module.exports = mapToArray;
    }
  });

  // node_modules/lodash/_setToArray.js
  var require_setToArray = __commonJS({
    "node_modules/lodash/_setToArray.js"(exports, module) {
      function setToArray(set) {
        var index = -1, result = Array(set.size);
        set.forEach(function(value) {
          result[++index] = value;
        });
        return result;
      }
      module.exports = setToArray;
    }
  });

  // node_modules/lodash/_equalByTag.js
  var require_equalByTag = __commonJS({
    "node_modules/lodash/_equalByTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var Uint8Array2 = require_Uint8Array();
      var eq = require_eq();
      var equalArrays = require_equalArrays();
      var mapToArray = require_mapToArray();
      var setToArray = require_setToArray();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var errorTag = "[object Error]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var symbolTag = "[object Symbol]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
              return false;
            }
            object = object.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);
          case errorTag:
            return object.name == other.name && object.message == other.message;
          case regexpTag:
          case stringTag:
            return object == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object);
            return result;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      module.exports = equalByTag;
    }
  });

  // node_modules/lodash/_arrayPush.js
  var require_arrayPush = __commonJS({
    "node_modules/lodash/_arrayPush.js"(exports, module) {
      function arrayPush(array, values) {
        var index = -1, length = values.length, offset = array.length;
        while (++index < length) {
          array[offset + index] = values[index];
        }
        return array;
      }
      module.exports = arrayPush;
    }
  });

  // node_modules/lodash/isArray.js
  var require_isArray = __commonJS({
    "node_modules/lodash/isArray.js"(exports, module) {
      var isArray = Array.isArray;
      module.exports = isArray;
    }
  });

  // node_modules/lodash/_baseGetAllKeys.js
  var require_baseGetAllKeys = __commonJS({
    "node_modules/lodash/_baseGetAllKeys.js"(exports, module) {
      var arrayPush = require_arrayPush();
      var isArray = require_isArray();
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result = keysFunc(object);
        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
      }
      module.exports = baseGetAllKeys;
    }
  });

  // node_modules/lodash/_arrayFilter.js
  var require_arrayFilter = __commonJS({
    "node_modules/lodash/_arrayFilter.js"(exports, module) {
      function arrayFilter(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
        while (++index < length) {
          var value = array[index];
          if (predicate(value, index, array)) {
            result[resIndex++] = value;
          }
        }
        return result;
      }
      module.exports = arrayFilter;
    }
  });

  // node_modules/lodash/stubArray.js
  var require_stubArray = __commonJS({
    "node_modules/lodash/stubArray.js"(exports, module) {
      function stubArray() {
        return [];
      }
      module.exports = stubArray;
    }
  });

  // node_modules/lodash/_getSymbols.js
  var require_getSymbols = __commonJS({
    "node_modules/lodash/_getSymbols.js"(exports, module) {
      var arrayFilter = require_arrayFilter();
      var stubArray = require_stubArray();
      var objectProto = Object.prototype;
      var propertyIsEnumerable = objectProto.propertyIsEnumerable;
      var nativeGetSymbols = Object.getOwnPropertySymbols;
      var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
        if (object == null) {
          return [];
        }
        object = Object(object);
        return arrayFilter(nativeGetSymbols(object), function(symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
      module.exports = getSymbols;
    }
  });

  // node_modules/lodash/_baseTimes.js
  var require_baseTimes = __commonJS({
    "node_modules/lodash/_baseTimes.js"(exports, module) {
      function baseTimes(n, iteratee) {
        var index = -1, result = Array(n);
        while (++index < n) {
          result[index] = iteratee(index);
        }
        return result;
      }
      module.exports = baseTimes;
    }
  });

  // node_modules/lodash/isObjectLike.js
  var require_isObjectLike = __commonJS({
    "node_modules/lodash/isObjectLike.js"(exports, module) {
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      module.exports = isObjectLike;
    }
  });

  // node_modules/lodash/_baseIsArguments.js
  var require_baseIsArguments = __commonJS({
    "node_modules/lodash/_baseIsArguments.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObjectLike = require_isObjectLike();
      var argsTag = "[object Arguments]";
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      module.exports = baseIsArguments;
    }
  });

  // node_modules/lodash/isArguments.js
  var require_isArguments = __commonJS({
    "node_modules/lodash/isArguments.js"(exports, module) {
      var baseIsArguments = require_baseIsArguments();
      var isObjectLike = require_isObjectLike();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var propertyIsEnumerable = objectProto.propertyIsEnumerable;
      var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
        return arguments;
      })()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      module.exports = isArguments;
    }
  });

  // node_modules/lodash/stubFalse.js
  var require_stubFalse = __commonJS({
    "node_modules/lodash/stubFalse.js"(exports, module) {
      function stubFalse() {
        return false;
      }
      module.exports = stubFalse;
    }
  });

  // node_modules/lodash/isBuffer.js
  var require_isBuffer = __commonJS({
    "node_modules/lodash/isBuffer.js"(exports, module) {
      var root = require_root();
      var stubFalse = require_stubFalse();
      var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
      var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var Buffer2 = moduleExports ? root.Buffer : void 0;
      var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
      var isBuffer = nativeIsBuffer || stubFalse;
      module.exports = isBuffer;
    }
  });

  // node_modules/lodash/_isIndex.js
  var require_isIndex = __commonJS({
    "node_modules/lodash/_isIndex.js"(exports, module) {
      var MAX_SAFE_INTEGER = 9007199254740991;
      var reIsUint = /^(?:0|[1-9]\d*)$/;
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      module.exports = isIndex;
    }
  });

  // node_modules/lodash/isLength.js
  var require_isLength = __commonJS({
    "node_modules/lodash/isLength.js"(exports, module) {
      var MAX_SAFE_INTEGER = 9007199254740991;
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      module.exports = isLength;
    }
  });

  // node_modules/lodash/_baseIsTypedArray.js
  var require_baseIsTypedArray = __commonJS({
    "node_modules/lodash/_baseIsTypedArray.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isLength = require_isLength();
      var isObjectLike = require_isObjectLike();
      var argsTag = "[object Arguments]";
      var arrayTag = "[object Array]";
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var errorTag = "[object Error]";
      var funcTag = "[object Function]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var objectTag = "[object Object]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var weakMapTag = "[object WeakMap]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var float32Tag = "[object Float32Array]";
      var float64Tag = "[object Float64Array]";
      var int8Tag = "[object Int8Array]";
      var int16Tag = "[object Int16Array]";
      var int32Tag = "[object Int32Array]";
      var uint8Tag = "[object Uint8Array]";
      var uint8ClampedTag = "[object Uint8ClampedArray]";
      var uint16Tag = "[object Uint16Array]";
      var uint32Tag = "[object Uint32Array]";
      var typedArrayTags = {};
      typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
      typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      module.exports = baseIsTypedArray;
    }
  });

  // node_modules/lodash/_baseUnary.js
  var require_baseUnary = __commonJS({
    "node_modules/lodash/_baseUnary.js"(exports, module) {
      function baseUnary(func) {
        return function(value) {
          return func(value);
        };
      }
      module.exports = baseUnary;
    }
  });

  // node_modules/lodash/_nodeUtil.js
  var require_nodeUtil = __commonJS({
    "node_modules/lodash/_nodeUtil.js"(exports, module) {
      var freeGlobal = require_freeGlobal();
      var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
      var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var freeProcess = moduleExports && freeGlobal.process;
      var nodeUtil = (function() {
        try {
          var types = freeModule && freeModule.require && freeModule.require("util").types;
          if (types) {
            return types;
          }
          return freeProcess && freeProcess.binding && freeProcess.binding("util");
        } catch (e) {
        }
      })();
      module.exports = nodeUtil;
    }
  });

  // node_modules/lodash/isTypedArray.js
  var require_isTypedArray = __commonJS({
    "node_modules/lodash/isTypedArray.js"(exports, module) {
      var baseIsTypedArray = require_baseIsTypedArray();
      var baseUnary = require_baseUnary();
      var nodeUtil = require_nodeUtil();
      var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      module.exports = isTypedArray;
    }
  });

  // node_modules/lodash/_arrayLikeKeys.js
  var require_arrayLikeKeys = __commonJS({
    "node_modules/lodash/_arrayLikeKeys.js"(exports, module) {
      var baseTimes = require_baseTimes();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var isBuffer = require_isBuffer();
      var isIndex = require_isIndex();
      var isTypedArray = require_isTypedArray();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
          isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
          isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
          isIndex(key, length)))) {
            result.push(key);
          }
        }
        return result;
      }
      module.exports = arrayLikeKeys;
    }
  });

  // node_modules/lodash/_isPrototype.js
  var require_isPrototype = __commonJS({
    "node_modules/lodash/_isPrototype.js"(exports, module) {
      var objectProto = Object.prototype;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      module.exports = isPrototype;
    }
  });

  // node_modules/lodash/_overArg.js
  var require_overArg = __commonJS({
    "node_modules/lodash/_overArg.js"(exports, module) {
      function overArg(func, transform) {
        return function(arg) {
          return func(transform(arg));
        };
      }
      module.exports = overArg;
    }
  });

  // node_modules/lodash/_nativeKeys.js
  var require_nativeKeys = __commonJS({
    "node_modules/lodash/_nativeKeys.js"(exports, module) {
      var overArg = require_overArg();
      var nativeKeys = overArg(Object.keys, Object);
      module.exports = nativeKeys;
    }
  });

  // node_modules/lodash/_baseKeys.js
  var require_baseKeys = __commonJS({
    "node_modules/lodash/_baseKeys.js"(exports, module) {
      var isPrototype = require_isPrototype();
      var nativeKeys = require_nativeKeys();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result = [];
        for (var key in Object(object)) {
          if (hasOwnProperty.call(object, key) && key != "constructor") {
            result.push(key);
          }
        }
        return result;
      }
      module.exports = baseKeys;
    }
  });

  // node_modules/lodash/isArrayLike.js
  var require_isArrayLike = __commonJS({
    "node_modules/lodash/isArrayLike.js"(exports, module) {
      var isFunction = require_isFunction();
      var isLength = require_isLength();
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      module.exports = isArrayLike;
    }
  });

  // node_modules/lodash/keys.js
  var require_keys = __commonJS({
    "node_modules/lodash/keys.js"(exports, module) {
      var arrayLikeKeys = require_arrayLikeKeys();
      var baseKeys = require_baseKeys();
      var isArrayLike = require_isArrayLike();
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }
      module.exports = keys;
    }
  });

  // node_modules/lodash/_getAllKeys.js
  var require_getAllKeys = __commonJS({
    "node_modules/lodash/_getAllKeys.js"(exports, module) {
      var baseGetAllKeys = require_baseGetAllKeys();
      var getSymbols = require_getSymbols();
      var keys = require_keys();
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      module.exports = getAllKeys;
    }
  });

  // node_modules/lodash/_equalObjects.js
  var require_equalObjects = __commonJS({
    "node_modules/lodash/_equalObjects.js"(exports, module) {
      var getAllKeys = require_getAllKeys();
      var COMPARE_PARTIAL_FLAG = 1;
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object;
        }
        var result = true;
        stack.set(object, other);
        stack.set(other, object);
        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
          }
          if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result && !skipCtor) {
          var objCtor = object.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result = false;
          }
        }
        stack["delete"](object);
        stack["delete"](other);
        return result;
      }
      module.exports = equalObjects;
    }
  });

  // node_modules/lodash/_DataView.js
  var require_DataView = __commonJS({
    "node_modules/lodash/_DataView.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var DataView = getNative(root, "DataView");
      module.exports = DataView;
    }
  });

  // node_modules/lodash/_Promise.js
  var require_Promise = __commonJS({
    "node_modules/lodash/_Promise.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Promise2 = getNative(root, "Promise");
      module.exports = Promise2;
    }
  });

  // node_modules/lodash/_Set.js
  var require_Set = __commonJS({
    "node_modules/lodash/_Set.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Set2 = getNative(root, "Set");
      module.exports = Set2;
    }
  });

  // node_modules/lodash/_WeakMap.js
  var require_WeakMap = __commonJS({
    "node_modules/lodash/_WeakMap.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var WeakMap = getNative(root, "WeakMap");
      module.exports = WeakMap;
    }
  });

  // node_modules/lodash/_getTag.js
  var require_getTag = __commonJS({
    "node_modules/lodash/_getTag.js"(exports, module) {
      var DataView = require_DataView();
      var Map2 = require_Map();
      var Promise2 = require_Promise();
      var Set2 = require_Set();
      var WeakMap = require_WeakMap();
      var baseGetTag = require_baseGetTag();
      var toSource = require_toSource();
      var mapTag = "[object Map]";
      var objectTag = "[object Object]";
      var promiseTag = "[object Promise]";
      var setTag = "[object Set]";
      var weakMapTag = "[object WeakMap]";
      var dataViewTag = "[object DataView]";
      var dataViewCtorString = toSource(DataView);
      var mapCtorString = toSource(Map2);
      var promiseCtorString = toSource(Promise2);
      var setCtorString = toSource(Set2);
      var weakMapCtorString = toSource(WeakMap);
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result;
        };
      }
      module.exports = getTag;
    }
  });

  // node_modules/lodash/_baseIsEqualDeep.js
  var require_baseIsEqualDeep = __commonJS({
    "node_modules/lodash/_baseIsEqualDeep.js"(exports, module) {
      var Stack = require_Stack();
      var equalArrays = require_equalArrays();
      var equalByTag = require_equalByTag();
      var equalObjects = require_equalObjects();
      var getTag = require_getTag();
      var isArray = require_isArray();
      var isBuffer = require_isBuffer();
      var isTypedArray = require_isTypedArray();
      var COMPARE_PARTIAL_FLAG = 1;
      var argsTag = "[object Arguments]";
      var arrayTag = "[object Array]";
      var objectTag = "[object Object]";
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack());
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }
      module.exports = baseIsEqualDeep;
    }
  });

  // node_modules/lodash/_baseIsEqual.js
  var require_baseIsEqual = __commonJS({
    "node_modules/lodash/_baseIsEqual.js"(exports, module) {
      var baseIsEqualDeep = require_baseIsEqualDeep();
      var isObjectLike = require_isObjectLike();
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      module.exports = baseIsEqual;
    }
  });

  // node_modules/lodash/_baseIsMatch.js
  var require_baseIsMatch = __commonJS({
    "node_modules/lodash/_baseIsMatch.js"(exports, module) {
      var Stack = require_Stack();
      var baseIsEqual = require_baseIsEqual();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      function baseIsMatch(object, source, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (object == null) {
          return !length;
        }
        object = Object(object);
        while (index--) {
          var data = matchData[index];
          if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0], objValue = object[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === void 0 && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack();
            if (customizer) {
              var result = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
              return false;
            }
          }
        }
        return true;
      }
      module.exports = baseIsMatch;
    }
  });

  // node_modules/lodash/_isStrictComparable.js
  var require_isStrictComparable = __commonJS({
    "node_modules/lodash/_isStrictComparable.js"(exports, module) {
      var isObject = require_isObject();
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }
      module.exports = isStrictComparable;
    }
  });

  // node_modules/lodash/_getMatchData.js
  var require_getMatchData = __commonJS({
    "node_modules/lodash/_getMatchData.js"(exports, module) {
      var isStrictComparable = require_isStrictComparable();
      var keys = require_keys();
      function getMatchData(object) {
        var result = keys(object), length = result.length;
        while (length--) {
          var key = result[length], value = object[key];
          result[length] = [key, value, isStrictComparable(value)];
        }
        return result;
      }
      module.exports = getMatchData;
    }
  });

  // node_modules/lodash/_matchesStrictComparable.js
  var require_matchesStrictComparable = __commonJS({
    "node_modules/lodash/_matchesStrictComparable.js"(exports, module) {
      function matchesStrictComparable(key, srcValue) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
        };
      }
      module.exports = matchesStrictComparable;
    }
  });

  // node_modules/lodash/_baseMatches.js
  var require_baseMatches = __commonJS({
    "node_modules/lodash/_baseMatches.js"(exports, module) {
      var baseIsMatch = require_baseIsMatch();
      var getMatchData = require_getMatchData();
      var matchesStrictComparable = require_matchesStrictComparable();
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }
      module.exports = baseMatches;
    }
  });

  // node_modules/lodash/isSymbol.js
  var require_isSymbol = __commonJS({
    "node_modules/lodash/isSymbol.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObjectLike = require_isObjectLike();
      var symbolTag = "[object Symbol]";
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      module.exports = isSymbol;
    }
  });

  // node_modules/lodash/_isKey.js
  var require_isKey = __commonJS({
    "node_modules/lodash/_isKey.js"(exports, module) {
      var isArray = require_isArray();
      var isSymbol = require_isSymbol();
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
      var reIsPlainProp = /^\w*$/;
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
      }
      module.exports = isKey;
    }
  });

  // node_modules/lodash/memoize.js
  var require_memoize = __commonJS({
    "node_modules/lodash/memoize.js"(exports, module) {
      var MapCache = require_MapCache();
      var FUNC_ERROR_TEXT = "Expected a function";
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result = func.apply(this, args);
          memoized.cache = cache.set(key, result) || cache;
          return result;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      module.exports = memoize;
    }
  });

  // node_modules/lodash/_memoizeCapped.js
  var require_memoizeCapped = __commonJS({
    "node_modules/lodash/_memoizeCapped.js"(exports, module) {
      var memoize = require_memoize();
      var MAX_MEMOIZE_SIZE = 500;
      function memoizeCapped(func) {
        var result = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result.cache;
        return result;
      }
      module.exports = memoizeCapped;
    }
  });

  // node_modules/lodash/_stringToPath.js
  var require_stringToPath = __commonJS({
    "node_modules/lodash/_stringToPath.js"(exports, module) {
      var memoizeCapped = require_memoizeCapped();
      var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = memoizeCapped(function(string) {
        var result = [];
        if (string.charCodeAt(0) === 46) {
          result.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result;
      });
      module.exports = stringToPath;
    }
  });

  // node_modules/lodash/_arrayMap.js
  var require_arrayMap = __commonJS({
    "node_modules/lodash/_arrayMap.js"(exports, module) {
      function arrayMap(array, iteratee) {
        var index = -1, length = array == null ? 0 : array.length, result = Array(length);
        while (++index < length) {
          result[index] = iteratee(array[index], index, array);
        }
        return result;
      }
      module.exports = arrayMap;
    }
  });

  // node_modules/lodash/_baseToString.js
  var require_baseToString = __commonJS({
    "node_modules/lodash/_baseToString.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var arrayMap = require_arrayMap();
      var isArray = require_isArray();
      var isSymbol = require_isSymbol();
      var INFINITY = 1 / 0;
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      module.exports = baseToString;
    }
  });

  // node_modules/lodash/toString.js
  var require_toString = __commonJS({
    "node_modules/lodash/toString.js"(exports, module) {
      var baseToString = require_baseToString();
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      module.exports = toString;
    }
  });

  // node_modules/lodash/_castPath.js
  var require_castPath = __commonJS({
    "node_modules/lodash/_castPath.js"(exports, module) {
      var isArray = require_isArray();
      var isKey = require_isKey();
      var stringToPath = require_stringToPath();
      var toString = require_toString();
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      module.exports = castPath;
    }
  });

  // node_modules/lodash/_toKey.js
  var require_toKey = __commonJS({
    "node_modules/lodash/_toKey.js"(exports, module) {
      var isSymbol = require_isSymbol();
      var INFINITY = 1 / 0;
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      module.exports = toKey;
    }
  });

  // node_modules/lodash/_baseGet.js
  var require_baseGet = __commonJS({
    "node_modules/lodash/_baseGet.js"(exports, module) {
      var castPath = require_castPath();
      var toKey = require_toKey();
      function baseGet(object, path) {
        path = castPath(path, object);
        var index = 0, length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index == length ? object : void 0;
      }
      module.exports = baseGet;
    }
  });

  // node_modules/lodash/get.js
  var require_get = __commonJS({
    "node_modules/lodash/get.js"(exports, module) {
      var baseGet = require_baseGet();
      function get(object, path, defaultValue) {
        var result = object == null ? void 0 : baseGet(object, path);
        return result === void 0 ? defaultValue : result;
      }
      module.exports = get;
    }
  });

  // node_modules/lodash/_baseHasIn.js
  var require_baseHasIn = __commonJS({
    "node_modules/lodash/_baseHasIn.js"(exports, module) {
      function baseHasIn(object, key) {
        return object != null && key in Object(object);
      }
      module.exports = baseHasIn;
    }
  });

  // node_modules/lodash/_hasPath.js
  var require_hasPath = __commonJS({
    "node_modules/lodash/_hasPath.js"(exports, module) {
      var castPath = require_castPath();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var isIndex = require_isIndex();
      var isLength = require_isLength();
      var toKey = require_toKey();
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);
        var index = -1, length = path.length, result = false;
        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result || ++index != length) {
          return result;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
      }
      module.exports = hasPath;
    }
  });

  // node_modules/lodash/hasIn.js
  var require_hasIn = __commonJS({
    "node_modules/lodash/hasIn.js"(exports, module) {
      var baseHasIn = require_baseHasIn();
      var hasPath = require_hasPath();
      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }
      module.exports = hasIn;
    }
  });

  // node_modules/lodash/_baseMatchesProperty.js
  var require_baseMatchesProperty = __commonJS({
    "node_modules/lodash/_baseMatchesProperty.js"(exports, module) {
      var baseIsEqual = require_baseIsEqual();
      var get = require_get();
      var hasIn = require_hasIn();
      var isKey = require_isKey();
      var isStrictComparable = require_isStrictComparable();
      var matchesStrictComparable = require_matchesStrictComparable();
      var toKey = require_toKey();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      module.exports = baseMatchesProperty;
    }
  });

  // node_modules/lodash/identity.js
  var require_identity = __commonJS({
    "node_modules/lodash/identity.js"(exports, module) {
      function identity(value) {
        return value;
      }
      module.exports = identity;
    }
  });

  // node_modules/lodash/_baseProperty.js
  var require_baseProperty = __commonJS({
    "node_modules/lodash/_baseProperty.js"(exports, module) {
      function baseProperty(key) {
        return function(object) {
          return object == null ? void 0 : object[key];
        };
      }
      module.exports = baseProperty;
    }
  });

  // node_modules/lodash/_basePropertyDeep.js
  var require_basePropertyDeep = __commonJS({
    "node_modules/lodash/_basePropertyDeep.js"(exports, module) {
      var baseGet = require_baseGet();
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }
      module.exports = basePropertyDeep;
    }
  });

  // node_modules/lodash/property.js
  var require_property = __commonJS({
    "node_modules/lodash/property.js"(exports, module) {
      var baseProperty = require_baseProperty();
      var basePropertyDeep = require_basePropertyDeep();
      var isKey = require_isKey();
      var toKey = require_toKey();
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      module.exports = property;
    }
  });

  // node_modules/lodash/_baseIteratee.js
  var require_baseIteratee = __commonJS({
    "node_modules/lodash/_baseIteratee.js"(exports, module) {
      var baseMatches = require_baseMatches();
      var baseMatchesProperty = require_baseMatchesProperty();
      var identity = require_identity();
      var isArray = require_isArray();
      var property = require_property();
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == "object") {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      module.exports = baseIteratee;
    }
  });

  // node_modules/lodash/_baseSortedIndexBy.js
  var require_baseSortedIndexBy = __commonJS({
    "node_modules/lodash/_baseSortedIndexBy.js"(exports, module) {
      var isSymbol = require_isSymbol();
      var MAX_ARRAY_LENGTH = 4294967295;
      var MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1;
      var nativeFloor = Math.floor;
      var nativeMin = Math.min;
      function baseSortedIndexBy(array, value, iteratee, retHighest) {
        var low = 0, high = array == null ? 0 : array.length;
        if (high === 0) {
          return 0;
        }
        value = iteratee(value);
        var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === void 0;
        while (low < high) {
          var mid = nativeFloor((low + high) / 2), computed = iteratee(array[mid]), othIsDefined = computed !== void 0, othIsNull = computed === null, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed <= value : computed < value;
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }
      module.exports = baseSortedIndexBy;
    }
  });

  // node_modules/lodash/sortedIndexBy.js
  var require_sortedIndexBy = __commonJS({
    "node_modules/lodash/sortedIndexBy.js"(exports, module) {
      var baseIteratee = require_baseIteratee();
      var baseSortedIndexBy = require_baseSortedIndexBy();
      function sortedIndexBy2(array, value, iteratee) {
        return baseSortedIndexBy(array, value, baseIteratee(iteratee, 2));
      }
      module.exports = sortedIndexBy2;
    }
  });

  // src/immo/index.js
  var Immo = class {
    static __props__() {
      return {};
    }
    static __state__() {
      return {};
    }
    static __computed__() {
      return {};
    }
    static get __update__() {
      return {};
    }
    constructor({ props, state, computed } = {}) {
      let current = this;
      Object.defineProperties(this, {
        __init__: {
          value: this
        },
        __current__: {
          get: () => current,
          set: (next) => {
            current = next;
          }
        },
        __props__: {
          value: Object.assign(this.constructor.__props__.call(this), props)
        },
        __state__: {
          value: Object.assign(this.constructor.__state__.call(this), state)
        },
        __computed__: {
          value: Object.assign(this.constructor.__computed__.call(this), computed)
        }
      });
    }
    updateState(updated) {
      let next = Object.create(this.__init__, {
        __state__: {
          value: Object.assign({}, this.__state__, updated)
        }
      });
      this.__current__ = next;
      return next;
    }
    updateComputed() {
      if (this !== this.__current__) {
        let updateFns = this.constructor.__update__;
        let current = this.__current__;
        this.__current__ = this;
        for (let stateKey in updateFns) {
          let targetState = this[stateKey];
          let currentState = current[stateKey];
          if (currentState !== targetState) {
            updateFns[stateKey].call(this, targetState, currentState, current);
          }
        }
      }
    }
  };
  function setupImmo(Subclass) {
    makeImmoStaticProps(Subclass);
    makeImmoAccessors(Subclass);
  }
  function defineAccessors(obj, keys, getPropsKey, setPropsKey) {
    if (!keys) return;
    for (let key of keys) {
      Object.defineProperty(obj, key, {
        get: getPropsKey(key),
        set: setPropsKey && setPropsKey(key)
      });
    }
  }
  function makeImmoAccessors(Subclass) {
    let defineImmoAccessors = (getObj, getPropsKey, setPropsKey) => !getObj ? null : defineAccessors(Subclass.prototype, Object.keys(getObj.call(Subclass.prototype)), getPropsKey, setPropsKey);
    defineImmoAccessors(Subclass.__props__, (key) => function() {
      return this.__props__[key];
    });
    defineImmoAccessors(Subclass.__state__, (key) => function() {
      return this.__state__[key];
    });
    defineImmoAccessors(
      Subclass.__computed__,
      (key) => function() {
        return this.__computed__[key];
      },
      (key) => function(value) {
        this.__computed__[key] = value;
      }
    );
  }
  function makeImmoStaticProps(Subclass) {
    let Superclass = Object.getPrototypeOf(Subclass);
    let propObj = {};
    if (Subclass.prototype.__props__) {
      propObj.__props__ = {
        value() {
          return Object.assign(Superclass.__props__.call(this), Subclass.prototype.__props__.call(this));
        }
      };
    }
    if (Subclass.prototype.__state__) {
      propObj.__state__ = {
        value() {
          return Object.assign(Superclass.__state__.call(this), Subclass.prototype.__state__.call(this));
        }
      };
    }
    if (Subclass.prototype.__computed__) {
      propObj.__computed__ = {
        value() {
          return Object.assign(Superclass.__computed__.call(this), Subclass.prototype.__computed__.call(this));
        }
      };
    }
    if (Subclass.prototype.__update__) {
      propObj.__update__ = {
        value: Object.assign({}, Superclass.__update__, Subclass.prototype.__update__())
      };
    }
    Object.defineProperties(Subclass, propObj);
  }

  // src/line-engine/LineEngine.js
  var import_immy2 = __toESM(require_immy());

  // src/line-engine/Frame.js
  var import_immy = __toESM(require_immy());
  var CellFrame = class {
    constructor(index, entity) {
      this.index = index;
      this.entities = [entity];
    }
    add(entity) {
      this.entities.push(entity);
    }
    hasCollisionWith(line) {
      return this.entities.some((entity) => line.collidesWith(entity));
    }
  };
  function makeCellFrames(index, entity) {
    return new import_immy.default.List([new CellFrame(index, entity)]);
  }
  function addEntityToCellFrames(cellFrames, index, entity) {
    let cellFrame = cellFrames.get(cellFrames.size() - 1);
    if (index === cellFrame.index) {
      cellFrame.add(entity);
      return cellFrames;
    } else {
      return cellFrames.push(new CellFrame(index, entity));
    }
  }
  var Frame = class _Frame {
    constructor(stateMap = /* @__PURE__ */ new Map(), grid = new import_immy.default.Map(), collisions = new import_immy.default.Map(), updates = []) {
      this.stateMap = stateMap;
      this.grid = grid;
      this.collisions = collisions;
      this.updates = updates;
    }
    clone() {
      return new _Frame(new Map(this.stateMap), this.grid, this.collisions);
    }
    getIndexOfCollisionInCell(cell, line) {
      if (!this.grid.has(cell)) return;
      let cellFrames = this.grid.get(cell);
      for (let i = 0; i < cellFrames.size(); i++) {
        let cellFrame = cellFrames.get(i);
        if (cellFrame.hasCollisionWith(line)) {
          return cellFrame.index;
        }
      }
    }
    getIndexOfCollisionWithLine(line) {
      let lineCollisions = this.collisions.get(line.id);
      if (lineCollisions) {
        return lineCollisions.get(0);
      }
    }
    updateStateMap(stateUpdate) {
      if (!stateUpdate) return;
      if (stateUpdate instanceof Array) {
        return stateUpdate.forEach((update) => this.updateStateMap(update));
      }
      this.updates.push(stateUpdate);
      for (let nextEntity of stateUpdate.updated) {
        this.stateMap.set(nextEntity.id, nextEntity);
      }
    }
    addToGrid(lineGrid, entity, index) {
      let cells = lineGrid.getCellsNearEntity(entity);
      for (let cell of cells) {
        let cellFrames = this.grid.get(cell);
        if (!cellFrames) {
          cellFrames = makeCellFrames(index, entity);
        } else {
          cellFrames = addEntityToCellFrames(cellFrames, index, entity);
        }
        this.grid = this.grid.withKeySetToValue(cell, cellFrames);
      }
    }
    addToCollisions(line, index) {
      let lineCollisions = this.collisions.get(line.id);
      if (!lineCollisions) {
        lineCollisions = new import_immy.default.List([index]);
      } else if (lineCollisions.get(lineCollisions.size() - 1) !== index) {
        lineCollisions = lineCollisions.push(index);
      } else {
        return;
      }
      this.collisions = this.collisions.withKeySetToValue(line.id, lineCollisions);
    }
  };

  // src/line-engine/StateUpdate.js
  var StateUpdate = class {
    /**
     * [constructor description]
     * @param  {Array} updated [description]
     * @param  {[type]} id      [description]
     */
    constructor(updated, id) {
      this.updated = updated;
      if (id != null) {
        this.id = id;
      }
    }
    get type() {
      return this.constructor.name;
    }
  };
  var StepUpdate = class extends StateUpdate {
  };
  var ConstraintUpdate = class extends StateUpdate {
  };
  var CollisionUpdate = class extends StateUpdate {
    constructor(updated, id) {
      super([updated], id);
    }
  };

  // src/line-engine/LineEngine.js
  var LineEngine = class extends Immo {
    __props__() {
      return {
        iterations: 1,
        stepOptions: {}
      };
    }
    __state__() {
      return {
        linesList: new import_immy2.default.List(),
        initialStateMap: /* @__PURE__ */ new Map(),
        constraints: /* @__PURE__ */ new Map()
      };
    }
    __computed__() {
      return {
        linesMap: /* @__PURE__ */ new Map(),
        frames: [new Frame()],
        // state IDs
        steppables: [],
        collidables: [],
        // constraint IDs
        iterating: [],
        noniterating: [],
        grid: this.makeGrid()
      };
    }
    __update__() {
      return {
        linesList(targetLinesList, currentLinesList) {
          let diff = currentLinesList.compareTo(targetLinesList);
          diff.forEachPrimitive((primOp) => {
            let line = primOp.value;
            if (primOp instanceof import_immy2.default.ListPatches.Add) {
              this._addLine(line);
            } else {
              this._removeLine(line);
            }
          });
        },
        initialStateMap(targetInitState) {
          this.setInitialStates(Array.from(targetInitState.values()));
        },
        constraints(targetConstraints) {
          this.setConstraints(Array.from(targetConstraints.values()));
        }
      };
    }
    makeGrid() {
    }
    getLastFrameIndex() {
      this.updateComputed();
      return this._getLastFrameIndex();
    }
    getLastFrame() {
      this.updateComputed();
      return this._getLastFrame();
    }
    getStateMapAtFrame(index) {
      this.updateComputed();
      this._computeFrame(index);
      return this.frames[index].stateMap;
    }
    getUpdatesAtFrame(index) {
      this.updateComputed();
      this._computeFrame(index);
      return this.frames[index].updates;
    }
    getLine(id) {
      this.updateComputed();
      return this.linesMap.get(id);
    }
    getMaxLineID() {
      this.updateComputed();
      let length = this.linesList.size();
      if (length === 0) {
        return null;
      }
      return this.linesList.get(length - 1).id;
    }
    addLine(line) {
      this.updateComputed();
      let nextLinesList = this._modifyLinesList(line, (lines, line2) => {
        this._addLine(line2);
        let index = lines.findInsertionIndexWithBinarySearch((existing) => existing.id - line2.id);
        return lines.withValueAdded(index, line2);
      });
      return this.updateState({ linesList: nextLinesList });
    }
    removeLine(line) {
      this.updateComputed();
      let nextLinesList = this._modifyLinesList(line, (lines, line2) => {
        this._removeLine(line2);
        let index = lines.findIndexWithBinarySearch((existing) => existing.id - line2.id);
        return lines.withValueRemoved(index, line2);
      });
      return this.updateState({ linesList: nextLinesList });
    }
    // state: array of {id, collidable, ...}
    setInitialStates(stateArray) {
      this.updateComputed();
      this._setFramesLength(1);
      this.steppables = stateArray.filter(({ steppable }) => steppable).map(({ id }) => id);
      this.collidables = stateArray.filter(({ collidable }) => collidable).map(({ id }) => id);
      let initialStateMap = new Map(stateArray.map((state) => [state.id, state]));
      this.frames[0] = new Frame(initialStateMap);
      return this.updateState({ initialStateMap });
    }
    setConstraints(constraints) {
      this.updateComputed();
      this._setFramesLength(1);
      this.iterating = constraints.filter(({ iterating }) => iterating).map(({ id }) => id);
      this.noniterating = constraints.filter(({ iterating }) => !iterating).map(({ id }) => id);
      let constraintsMap = new Map(constraints.map((constraint) => [constraint.id, constraint]));
      return this.updateState({ constraints: constraintsMap });
    }
    _addLine(line) {
      this.linesMap.set(line.id, line);
      let cells = this.grid.add(line);
      for (let cell of cells) {
        let index = this._getLastFrame().getIndexOfCollisionInCell(cell, line);
        if (index != null) {
          this._setFramesLength(index);
        }
      }
    }
    _removeLine(line) {
      this.linesMap.delete(line.id);
      this.grid.remove(line);
      let index = this._getLastFrame().getIndexOfCollisionWithLine(line);
      if (index != null) {
        this._setFramesLength(index);
      }
    }
    _modifyLinesList(line, modify) {
      if (line instanceof Array) {
        return line.reduce((lines, line2) => modify(lines, line2), this.linesList);
      } else {
        return modify(this.linesList, line);
      }
    }
    _setFramesLength(length) {
      this.frames.length = length;
    }
    _getLastFrameIndex() {
      return this.frames.length - 1;
    }
    _getLastFrame() {
      return this.frames[this._getLastFrameIndex()];
    }
    _computeFrame(index) {
      while (this.frames.length <= index) {
        let nextFrame = this._getNextFrame(this._getLastFrame(), this._getLastFrameIndex() + 1);
        this.frames.push(nextFrame);
      }
    }
    // step -> (resolve <-> collide) -> endResolve
    _getNextFrame(frame, index) {
      frame = frame.clone();
      this._stepStates(frame, this.steppables);
      for (let i = 0; i < this.iterations; i++) {
        this._resolveConstraints(frame, this.iterating);
        this._collideEntities(frame, this.collidables, index);
      }
      this._resolveConstraints(frame, this.noniterating);
      return frame;
    }
    _stepStates(frame, stateIDs) {
      let updatedStates = stateIDs.map(
        (id) => frame.stateMap.get(id).step(this.stepOptions)
      );
      frame.updateStateMap(new StepUpdate(updatedStates));
    }
    _resolveConstraints(frame, constraintIDs) {
      for (let id of constraintIDs) {
        let constraint = this.constraints.get(id);
        frame.updateStateMap(new ConstraintUpdate(constraint.resolve(frame.stateMap), id));
      }
    }
    _collideEntities(frame, stateIDs, index) {
      for (let id of stateIDs) {
        let entity = frame.stateMap.get(id);
        frame.addToGrid(this.grid, entity, index);
        let lines = this.grid.getLinesNearEntity(entity);
        for (let line of lines) {
          let nextEntity = line.collide(entity);
          if (nextEntity) {
            frame.updateStateMap(new CollisionUpdate(nextEntity, line.id));
            entity = nextEntity;
            frame.addToGrid(this.grid, entity, index);
            frame.addToCollisions(line, index);
          }
        }
      }
    }
  };
  setupImmo(LineEngine);

  // src/ordered-object-array/index.js
  var import_sortedIndexBy = __toESM(require_sortedIndexBy());

  // src/subclassable/assignPrototype.js
  function assignPrototype(Class, Subclassable, key) {
    Object.getOwnPropertyNames(Class.prototype).forEach((k) => {
      let d = Object.getOwnPropertyDescriptor(Class.prototype, k);
      if (k !== "constructor" && d.value instanceof Function) {
        Object.defineProperty(Subclassable.prototype, k, Object.assign({}, d, {
          value: function(...args) {
            return d.value.call(this[key], ...args);
          }
        }));
      }
    });
  }

  // src/subclassable/array.js
  var SubclassableArray = class {
    constructor(...args) {
      this.__array__ = new Array(...args);
    }
    toArray() {
      return this.__array__;
    }
    get(i) {
      return this.__array__[i];
    }
    set(i, v) {
      this.__array__[i] = v;
    }
    get length() {
      return this.__array__.length;
    }
    [Symbol.iterator]() {
      return this.__array__[Symbol.iterator]();
    }
  };
  assignPrototype(Array, SubclassableArray, "__array__");
  var ARRAY_SUBCLASSABLE = (() => {
    class C extends Array {
    }
    var c = new C();
    return c.concat(1) instanceof C;
  })();
  var array_default = ARRAY_SUBCLASSABLE ? class extends Array {
    toArray() {
      return this;
    }
    get(i) {
      return this[i];
    }
    set(i, v) {
      this[i] = v;
    }
  } : SubclassableArray;

  // src/subclassable/map.js
  var SubclassableMap = class {
    constructor(...args) {
      this.__map__ = new Map(...args);
    }
    get size() {
      return this.__map__.size;
    }
  };
  assignPrototype(Map, SubclassableMap, "__map__");
  var MAP_SUBCLASSABLE = (() => {
    var key = {};
    class M extends Map {
    }
    try {
      var map = new M();
      map.set(key, 123);
    } catch (e) {
      return false;
    }
    return map instanceof M && map.has(key) && map.get(key) === 123;
  })();
  var map_default = MAP_SUBCLASSABLE ? Map : SubclassableMap;

  // src/ordered-object-array/index.js
  var OrderedObjectArray = class extends array_default {
    constructor(key, descending = false) {
      super();
      this._key = key;
      this._getID = descending ? (obj) => -obj[this._key] : (obj) => obj[this._key];
      this._set = /* @__PURE__ */ new Set();
    }
    getIndexOf(obj) {
      return (0, import_sortedIndexBy.default)(this.toArray(), obj, this._getID);
    }
    has(obj) {
      return this._set.has(obj[this._key]);
    }
    add(obj) {
      if (!this.has(obj)) {
        this._set.add(obj[this._key]);
        let index = this.getIndexOf(obj);
        this.splice(index, 0, obj);
      }
    }
    remove(obj) {
      if (this.has(obj)) {
        this._set.delete(obj[this._key]);
        let index = this.getIndexOf(obj);
        this.splice(index, 1);
      }
    }
  };

  // src/g2/index.js
  function lineLineIntersection(x0, y0, x1, y1, x2, y2, x3, y3, inclusive) {
    const x01 = x1 - x0;
    const y01 = y1 - y0;
    const x23 = x3 - x2;
    const y23 = y3 - y2;
    const _01cross23 = x01 * y23 - x23 * y01;
    if (_01cross23 === 0) {
      return inclusive ? true : null;
    }
    const orientation = _01cross23 > 0;
    const x02 = x2 - x0;
    const y02 = y2 - y0;
    const _02cross01 = x02 * y01 - y02 * x01;
    if (_02cross01 === 0 ? !inclusive : _02cross01 < 0 === orientation) {
      return null;
    }
    const _02cross23 = x02 * y23 - y02 * x23;
    if (_02cross23 === 0 ? !inclusive : _02cross23 < 0 === orientation) {
      return null;
    }
    if (_02cross01 === _01cross23 ? !inclusive : _02cross01 > _01cross23 === orientation) {
      return null;
    }
    if (_02cross23 === _01cross23 ? !inclusive : _02cross23 > _01cross23 === orientation) {
      return null;
    }
    return _02cross23 / _01cross23;
  }
  function lineInBox(x0, y0, x1, y1, x2, y2, x3, y3, inclusive) {
    if (x2 < x3) {
      if (y2 < y3) {
        return lineInBoxOrdered(x0, y0, x1, y1, x2, y2, x3, y3, inclusive);
      } else {
        return lineInBoxOrdered(x0, y0, x1, y1, x2, y3, x3, y2, inclusive);
      }
    } else {
      if (y2 < y3) {
        return lineInBoxOrdered(x0, y0, x1, y1, x3, y2, x2, y3, inclusive);
      } else {
        return lineInBoxOrdered(x0, y0, x1, y1, x3, y3, x2, y2, inclusive);
      }
    }
  }
  function lineInBoxOrdered(x0, y0, x1, y1, x2, y2, x3, y3, inclusive) {
    let L0, R0, T0, B0, L1, R1, T1, B1;
    if (inclusive) {
      L0 = x0 < x2;
      R0 = x0 > x3;
      T0 = y0 < y2;
      B0 = y0 > y3;
      L1 = x1 < x2;
      R1 = x1 > x3;
      T1 = y1 < y2;
      B1 = y1 > y3;
    } else {
      L0 = x0 <= x2;
      R0 = x0 >= x3;
      T0 = y0 <= y2;
      B0 = y0 >= y3;
      L1 = x1 <= x2;
      R1 = x1 >= x3;
      T1 = y1 <= y2;
      B1 = y1 >= y3;
    }
    if (L0 && L1 || R0 && R1 || T0 && T1 || B0 && B1) {
      return false;
    }
    if (!L0 && !R0 && (!T0 && !B0 || !L1 && !R1) || !T1 && !B1 && (!L1 && !R1 || !T0 && !B0)) {
      return true;
    }
    if ((L0 || B0 || R1 || T1) && (R0 || T0 || L1 || B1)) {
      return lineLineIntersection(x0, y0, x1, y1, x2, y3, x3, y2, inclusive) !== null;
    } else {
      return lineLineIntersection(x0, y0, x1, y1, x2, y2, x3, y3, inclusive) !== null;
    }
  }
  function pointLineDistanceSquared(x0, y0, x1, y1, x2, y2) {
    const x12 = x2 - x1;
    const y12 = y2 - y1;
    const x10 = x0 - x1;
    const y10 = y0 - y1;
    const dot2 = x10 * x12 + y10 * y12;
    if (dot2 <= 0) {
      return x10 * x10 + y10 * y10;
    }
    const lengthSq = x12 * x12 + y12 * y12;
    if (dot2 >= lengthSq) {
      const x20 = x0 - x2;
      const y20 = y0 - y2;
      return x20 * x20 + y20 * y20;
    }
    const cross2 = x10 * y12 - y10 * x12;
    return cross2 * cross2 / lengthSq;
  }

  // src/line-space/LineSpace.js
  var LineSpace = class {
    constructor(getLineCoordinates) {
      this.getLineCoordinates = getLineCoordinates;
      this.lines = new OrderedObjectArray("id");
    }
    addLine(line) {
      this.lines.add(line);
    }
    removeLine(line) {
      this.lines.remove(line);
    }
    selectLinesInBox(x0, y0, x1, y1) {
      return this.lines.filter(
        (line) => lineInBox(...this.getLineCoordinates(line), x0, y0, x1, y1)
      );
    }
    selectLinesInRadius({ x, y }, r) {
      return this.lines.filter(
        (line) => pointLineDistanceSquared(x, y, ...this.getLineCoordinates(line)) < r * r
      );
    }
    selectClosestLineInRadius({ x, y }, r) {
      let closestLine = null;
      let closestLineDistanceSquared = r * r;
      for (let line of this.lines) {
        let lineDistanceSquared = pointLineDistanceSquared(x, y, ...this.getLineCoordinates(line));
        if (lineDistanceSquared < closestLineDistanceSquared) {
          closestLine = line;
          closestLineDistanceSquared = lineDistanceSquared;
        }
      }
      return closestLine;
    }
    getBoundingBox() {
      if (this.lines.length === 0) {
        return [0, 0, 0, 0];
      }
      let bb = [
        Number.MAX_VALUE,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MIN_VALUE
      ];
      const setNextBoundingBox = (x, y) => {
        if (x < bb[0]) {
          bb[0] = x;
        }
        if (y < bb[1]) {
          bb[1] = y;
        }
        if (x > bb[2]) {
          bb[2] = x;
        }
        if (y > bb[3]) {
          bb[3] = y;
        }
      };
      for (let line of this.lines) {
        let [x0, y0, x1, y1] = this.getLineCoordinates(line);
        setNextBoundingBox(x0, y0);
        setNextBoundingBox(x1, y1);
      }
      return bb;
    }
  };

  // src/line-rider-engine/constants.js
  var ITERATE = 6;
  var GRAVITY = { x: 0, y: 0.175 };
  var DEFAULT_START_POSITION = { x: 0, y: 0 };
  var DEFAULT_START_VELOCITY = { x: 0.4, y: 0 };

  // src/line-rider-engine/rider-data/index.json
  var rider_data_default = {
    states: [
      { id: "RIDER_MOUNTED", type: "Binding" },
      { id: "SLED_INTACT", type: "Binding" },
      { id: "PEG", type: "CollisionPoint", x: 0, y: 0, friction: 0.8 },
      { id: "TAIL", type: "CollisionPoint", x: 0, y: 5, friction: 0 },
      { id: "NOSE", type: "CollisionPoint", x: 15, y: 5, friction: 0 },
      { id: "STRING", type: "CollisionPoint", x: 17.5, y: 0, friction: 0 },
      { id: "BUTT", type: "CollisionPoint", x: 5, y: 0, friction: 0.8 },
      { id: "SHOULDER", type: "CollisionPoint", x: 5, y: -5.5, friction: 0.8 },
      { id: "RHAND", type: "CollisionPoint", x: 11.5, y: -5, friction: 0.1 },
      { id: "LHAND", type: "CollisionPoint", x: 11.5, y: -5, friction: 0.1 },
      { id: "LFOOT", type: "CollisionPoint", x: 10, y: 5, friction: 0 },
      { id: "RFOOT", type: "CollisionPoint", x: 10, y: 5, friction: 0 },
      { id: "SCARF_0", type: "FlutterPoint", x: 3, y: -5.5, airFriction: 0.2 },
      { id: "SCARF_1", type: "FlutterPoint", x: 1, y: -5.5, airFriction: 0.2 },
      { id: "SCARF_2", type: "FlutterPoint", x: -1, y: -5.5, airFriction: 0.2 },
      { id: "SCARF_3", type: "FlutterPoint", x: -3, y: -5.5, airFriction: 0.2 },
      { id: "SCARF_4", type: "FlutterPoint", x: -5, y: -5.5, airFriction: 0.2 },
      { id: "SCARF_5", type: "FlutterPoint", x: -7, y: -5.5, airFriction: 0.2 },
      { id: "SCARF_6", type: "FlutterPoint", x: -9, y: -5.5, airFriction: 0.2 }
    ],
    constraints: [
      { id: "PEG_TAIL", type: "Stick", p1: "PEG", p2: "TAIL" },
      { id: "TAIL_NOSE", type: "Stick", p1: "TAIL", p2: "NOSE" },
      { id: "NOSE_STRING", type: "Stick", p1: "NOSE", p2: "STRING" },
      { id: "STRING_PEG", type: "Stick", p1: "STRING", p2: "PEG" },
      { id: "PEG_NOSE", type: "Stick", p1: "PEG", p2: "NOSE" },
      { id: "STRING_TAIL", type: "Stick", p1: "STRING", p2: "TAIL" },
      { id: "PEG_BUTT", type: "BindStick", p1: "PEG", p2: "BUTT", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "TAIL_BUTT", type: "BindStick", p1: "TAIL", p2: "BUTT", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "NOSE_BUTT", type: "BindStick", p1: "NOSE", p2: "BUTT", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "SHOULDER_BUTT", type: "Stick", p1: "SHOULDER", p2: "BUTT" },
      { id: "SHOULDER_LHAND", type: "Stick", p1: "SHOULDER", p2: "LHAND" },
      { id: "SHOULDER_RHAND", type: "Stick", p1: "SHOULDER", p2: "RHAND" },
      { id: "BUTT_LFOOT", type: "Stick", p1: "BUTT", p2: "LFOOT" },
      { id: "BUTT_RFOOT", type: "Stick", p1: "BUTT", p2: "RFOOT" },
      { id: "SHOULDER_RHAND_2", type: "Stick", p1: "SHOULDER", p2: "RHAND" },
      { id: "SHOULDER_PEG", type: "BindStick", p1: "SHOULDER", p2: "PEG", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "STRING_LHAND", type: "BindStick", p1: "STRING", p2: "LHAND", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "STRING_RHAND", type: "BindStick", p1: "STRING", p2: "RHAND", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "LFOOT_NOSE", type: "BindStick", p1: "LFOOT", p2: "NOSE", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "RFOOT_NOSE", type: "BindStick", p1: "RFOOT", p2: "NOSE", binding: "RIDER_MOUNTED", endurance: 0.057 },
      { id: "SHOULDER_LFOOT", type: "RepelStick", p1: "SHOULDER", p2: "LFOOT", lengthFactor: 0.5 },
      { id: "SHOULDER_RFOOT", type: "RepelStick", p1: "SHOULDER", p2: "RFOOT", lengthFactor: 0.5 },
      { id: "BODY_SLED_JOINT", type: "BindJoint", p1: "SHOULDER", p2: "BUTT", q1: "STRING", q2: "PEG", binding: "RIDER_MOUNTED" },
      { id: "SLED_PEG_JOINT", type: "BindJoint", p1: "PEG", p2: "TAIL", q1: "STRING", q2: "PEG", binding: "SLED_INTACT" },
      { id: "RIDER_PEG_JOINT", type: "BindJoint", p1: "PEG", p2: "TAIL", q1: "STRING", q2: "PEG", binding: "RIDER_MOUNTED" },
      { id: "SCARF", type: "DirectedChain", ps: ["SHOULDER", "SCARF_0", "SCARF_1", "SCARF_2", "SCARF_3", "SCARF_4", "SCARF_5", "SCARF_6"] }
    ],
    parts: {
      SCARF: ["SHOULDER", "SCARF_0", "SCARF_1", "SCARF_2", "SCARF_3", "SCARF_4", "SCARF_5", "SCARF_6"],
      BODY: ["BUTT", "SHOULDER", "RHAND", "LHAND", "LFOOT", "RFOOT"],
      SLED: ["PEG", "STRING", "NOSE", "TAIL"],
      LEFT_ARM: ["SHOULDER", "LHAND"],
      RIGHT_ARM: ["SHOULDER", "RHAND"],
      LEFT_LEG: ["BUTT", "LFOOT"],
      RIGHT_LEG: ["BUTT", "RFOOT"]
    }
  };

  // src/line-rider-engine/states/index.js
  var states_exports = {};
  __export(states_exports, {
    Binding: () => Binding,
    CollisionPoint: () => CollisionPoint,
    FlutterPoint: () => FlutterPoint,
    Point: () => Point
  });

  // src/v2/index.js
  function len(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }
  function lenSq(v) {
    return v.x * v.x + v.y * v.y;
  }
  function angle(v) {
    return Math.atan2(v.y, v.x);
  }
  function angleTo(v, u) {
    return angle(u) - angle(v);
  }
  function dist(v, u) {
    const dx = u.x - v.x;
    const dy = u.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function distSq(v, u) {
    const dx = u.x - v.x;
    const dy = u.y - v.y;
    return dx * dx + dy * dy;
  }
  function dot(v, u) {
    return v.x * u.x + v.y * u.y;
  }
  function cross(v, u) {
    return v.x * u.y - v.y * u.x;
  }
  function equals(v, u) {
    return v.x === u.x && v.y === u.y;
  }
  var V2Functions = { len, lenSq, angle, angleTo, dist, distSq, dot, cross, equals };
  var V2Methods = {
    /* mutating methods */
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },
    mul(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },
    div(s) {
      this.x /= s;
      this.y /= s;
      return this;
    },
    norm() {
      this.div(this.len());
      return this;
    },
    // X axis →
    // Y axis ↓
    // rotates clockwise
    rot(rads) {
      const cos = Math.cos(rads);
      const sin = Math.sin(rads);
      const x = this.x;
      const y = this.y;
      this.x = x * cos - y * sin;
      this.y = x * sin + y * cos;
      return this;
    },
    rotCW() {
      const x = this.x;
      const y = this.y;
      this.x = -y;
      this.y = x;
      return this;
    },
    rotCCW() {
      const x = this.x;
      const y = this.y;
      this.x = y;
      this.y = -x;
      return this;
    }
  };
  for (let key in V2Functions) {
    let fn = V2Functions[key];
    V2Methods[key] = function(v) {
      return fn(this, v);
    };
  }
  function V2(v) {
    let u = Object.create(V2Methods);
    u.x = v.x;
    u.y = v.y;
    return u;
  }
  Object.assign(V2, V2Functions);
  var v2_default = V2;

  // src/line-rider-engine/states/index.js
  var ZERO_VEC = { x: 0, y: 0 };
  var Point = class extends Immo {
    __props__() {
      return {
        id: null,
        friction: 0,
        airFriction: 0,
        collidable: false,
        steppable: true
      };
    }
    __state__() {
      return {
        pos: { x: 0, y: 0 },
        prevPos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 }
      };
    }
    constructor({ id, x, y, friction = 0, airFriction = 0 }, { position = ZERO_VEC, velocity = ZERO_VEC } = {}) {
      super({
        props: { id, friction, airFriction },
        state: {
          pos: v2_default({ x, y }).add(position),
          vel: v2_default(velocity),
          prevPos: v2_default({ x, y }).add(position).sub(velocity)
        }
      });
    }
    getNextPos(vel) {
      return v2_default(this.pos).add(vel);
    }
    step({ gravity }) {
      let vel = v2_default(this.pos).sub(this.prevPos).mul(1 - this.airFriction).add(gravity);
      return this.updateState({
        pos: this.getNextPos(vel),
        prevPos: this.pos,
        vel
      });
    }
    setPosition(pos) {
      return this.updateState({ pos });
    }
  };
  setupImmo(Point);
  var CollisionPoint = class extends Point {
    __props__() {
      return {
        collidable: true
      };
    }
  };
  setupImmo(CollisionPoint);
  var V = { x: 12.9898, y: 78.233 };
  var K = 43758.5453;
  function rand(seed) {
    return Math.sin(v2_default.dot(seed, V)) * K % 1;
  }
  var INTENSITY = 2;
  var SPEED_THRESHOLD = 40;
  var FlutterPoint = class _FlutterPoint extends Point {
    static getFlutter(vel, seed) {
      let speed = Math.pow(v2_default.lenSq(vel), 0.25);
      let randMag = rand(vel);
      let randAng = rand(seed);
      randMag *= INTENSITY * speed * -Math.expm1(-speed / SPEED_THRESHOLD);
      randAng *= 2 * Math.PI;
      return {
        x: randMag * Math.cos(randAng),
        y: randMag * Math.sin(randAng)
      };
    }
    getNextPos(vel) {
      return v2_default(this.pos).add(vel).add(_FlutterPoint.getFlutter(vel, this.pos));
    }
  };
  var Binding = class extends Immo {
    __props__() {
      return {
        id: null,
        collidable: false,
        steppable: true
      };
    }
    __state__() {
      return {
        framesSinceUnbind: -1
      };
    }
    constructor({ id }) {
      super({ props: { id } });
    }
    isBinded() {
      return this.framesSinceUnbind === -1;
    }
    setBind(bind) {
      if (bind && !this.isBinded()) {
        return this.updateState({ framesSinceUnbind: -1 });
      } else if (!bind && this.isBinded()) {
        return this.updateState({ framesSinceUnbind: 0 });
      }
      return this;
    }
    step() {
      if (this.isBinded()) {
        return this;
      }
      return this.updateState({ framesSinceUnbind: this.framesSinceUnbind + 1 });
    }
  };
  setupImmo(Binding);

  // src/line-rider-engine/constraints/index.js
  var constraints_exports = {};
  __export(constraints_exports, {
    BindJoint: () => BindJoint,
    BindStick: () => BindStick,
    DirectedChain: () => DirectedChain,
    RepelStick: () => RepelStick,
    Stick: () => Stick
  });
  function stickResolve(p1, p2, diff) {
    let delta = v2_default(p1.pos).sub(p2.pos).mul(diff);
    return [
      p1.setPosition(v2_default(p1.pos).sub(delta)),
      p2.setPosition(delta.add(p2.pos))
    ];
  }
  function getDiff(restLength, length) {
    return length === 0 ? 0 : (length - restLength) / length;
  }
  var Stick = class {
    get iterating() {
      return true;
    }
    constructor({ id, p1, p2, length, lengthFactor = 1 }, initialStateMap) {
      length = length != null ? length : v2_default.dist(initialStateMap.get(p1).pos, initialStateMap.get(p2).pos);
      length *= lengthFactor;
      Object.assign(this, { id, p1, p2, length });
    }
    getDiff(length) {
      return getDiff(this.length, length) * 0.5;
    }
    resolve(stateMap) {
      let p1 = stateMap.get(this.p1);
      let p2 = stateMap.get(this.p2);
      let length = v2_default.dist(p1.pos, p2.pos);
      return stickResolve(p1, p2, this.getDiff(length));
    }
  };
  var RepelStick = class extends Stick {
    resolve(stateMap) {
      let p1 = stateMap.get(this.p1);
      let p2 = stateMap.get(this.p2);
      let length = v2_default.dist(p1.pos, p2.pos);
      if (length >= this.length) {
        return [];
      }
      return stickResolve(p1, p2, this.getDiff(length));
    }
  };
  var BindStick = class extends Stick {
    constructor({ id, p1, p2, length, binding, endurance }, initialStateMap) {
      super({ id, p1, p2, length }, initialStateMap);
      endurance = endurance * this.length * 0.5;
      Object.assign(this, { binding, endurance });
    }
    resolve(stateMap) {
      let binding = stateMap.get(this.binding);
      if (!binding.isBinded()) {
        return [];
      }
      let p1 = stateMap.get(this.p1);
      let p2 = stateMap.get(this.p2);
      let length = v2_default.dist(p1.pos, p2.pos);
      let diff = this.getDiff(length);
      if (diff > this.endurance) {
        return [binding.setBind(false)];
      }
      return stickResolve(p1, p2, diff);
    }
  };
  var BindJoint = class {
    get iterating() {
      return false;
    }
    constructor({ id, p1, p2, q1, q2, binding }) {
      Object.assign(this, { id, p1, p2, q1, q2, binding });
    }
    resolve(stateMap) {
      let p1 = stateMap.get(this.p1);
      let p2 = stateMap.get(this.p2);
      let q1 = stateMap.get(this.q1);
      let q2 = stateMap.get(this.q2);
      let binding = stateMap.get(this.binding);
      if (v2_default.cross(v2_default(p2.pos).sub(p1.pos), v2_default(q2.pos).sub(q1.pos)) >= 0) {
        return [];
      } else if (binding.isBinded()) {
        return [binding.setBind(false)];
      }
      return [];
    }
  };
  var DirectedChain = class {
    get iterating() {
      return false;
    }
    constructor({ id, ps }, initialStateMap) {
      let [, ...points] = ps;
      let lengths = points.map(
        (id2, i) => v2_default.dist(initialStateMap.get(id2).pos, initialStateMap.get(ps[i]).pos)
      );
      Object.assign(this, { id, ps, lengths });
    }
    resolve(stateMap) {
      let points = this.ps.map((id) => stateMap.get(id));
      for (let i = 1; i < points.length; i++) {
        let p0 = points[i - 1];
        let p1 = points[i];
        let restLength = this.lengths[i - 1];
        let length = v2_default.dist(p0.pos, p1.pos);
        let nextPosition = v2_default(p0.pos).sub(p1.pos).mul(getDiff(restLength, length)).add(p1.pos);
        points[i] = p1.setPosition(nextPosition);
      }
      [, ...points] = points;
      return points;
    }
  };

  // src/line-rider-engine/Rider.js
  function createConstraintFromJson(data, initialStateMap) {
    return new constraints_exports[data.type](data, initialStateMap);
  }
  function createStateFromJson(data, init) {
    return new states_exports[data.type](data, init);
  }
  function averageVectors(vecs) {
    return vecs.reduce((avg, v) => avg.add(v), v2_default({ x: 0, y: 0 })).div(vecs.length);
  }
  var Rider = class {
    constructor(riderBody = rider_data_default) {
      this.body = riderBody;
      let initialStateMap = new Map(this.makeStateArray().map((state) => [state.id, state]));
      this.constraints = riderBody.constraints.map((data) => createConstraintFromJson(data, initialStateMap));
    }
    makeStateArray(position, velocity) {
      return this.body.states.map(
        (stateData) => createStateFromJson(stateData, { position, velocity })
      );
    }
    getBody(stateMap) {
      let points = this.body.parts.BODY.map((id) => stateMap.get(id));
      return {
        position: averageVectors(points.map(({ pos }) => pos)),
        velocity: averageVectors(points.map(({ vel }) => vel)),
        get(id) {
          return stateMap.get(id);
        }
      };
    }
  };

  // src/utils/hashNumberPair.js
  function hashIntPair(a, b) {
    let A = a >= 0 ? 2 * a : -2 * a - 1;
    let B = b >= 0 ? 2 * b : -2 * b - 1;
    let C = A >= B ? A * A + A + B : B * B + A;
    return C & 1 ? -(C - 1) / 2 - 1 : C / 2;
  }

  // src/line-rider-engine/grids/getCellsFromLine.js
  function classicCells(line, gridSize) {
    let cellsPos = ClassicCells.getCellsPos(line, gridSize);
    return cellsPos.map(({ x, y }) => hashIntPair(x, y));
  }
  var ClassicCells = class {
    static getCellsPos(line, gridSize) {
      var cellsPos = [];
      let cellPosStart = getCellPosAndOffset(line.p1.x, line.p1.y, gridSize);
      let cellPosEnd = getCellPosAndOffset(line.p2.x, line.p2.y, gridSize);
      cellsPos.push(cellPosStart);
      if (line.c.vec.x === 0 && line.c.vec.y === 0 || cellPosStart.x === cellPosEnd.x && cellPosStart.y === cellPosEnd.y) {
        return cellsPos;
      }
      let box = getBox(cellPosStart.x, cellPosStart.y, cellPosEnd.x, cellPosEnd.y);
      let getNextPos;
      if (line.c.vec.x === 0) {
        getNextPos = (l, x, y, dx, dy) => {
          return { x, y: y + dy };
        };
      } else if (line.c.vec.y === 0) {
        getNextPos = (l, x, y, dx, dy) => {
          return { x: x + dx, y };
        };
      } else {
        getNextPos = this.getNextPos;
      }
      let cellPos = cellPosStart;
      let pos = { x: line.p1.x, y: line.p1.y };
      while (cellPos != null) {
        let d = this.getDelta(line, cellPos, gridSize);
        let nextPos = getNextPos(line, pos.x, pos.y, d.x, d.y);
        let nextCellPos = getCellPosAndOffset(nextPos.x, nextPos.y, gridSize);
        if (nextCellPos.x === cellPos.x && nextCellPos.y === cellPos.y) {
          break;
        }
        if (inBounds(nextCellPos, box)) {
          cellsPos.push(nextCellPos);
          cellPos = nextCellPos;
          pos = nextPos;
        } else {
          cellPos = null;
        }
      }
      return cellsPos;
    }
    static getNextPos(line, x, y, dx, dy) {
      let slope = line.c.vec.y / line.c.vec.x;
      let yNext = y + slope * dx;
      if (Math.abs(yNext - y) < Math.abs(dy)) {
        return {
          x: x + dx,
          y: yNext
        };
      }
      if (Math.abs(yNext - y) === Math.abs(dy)) {
        return {
          x: x + dx,
          y: y + dy
        };
      }
      return {
        x: x + line.c.vec.x * dy / line.c.vec.y,
        y: y + dy
      };
    }
    static getDelta(line, cellPos, gridSize) {
      let dx, dy;
      if (cellPos.x < 0) {
        dx = (gridSize + cellPos.gx) * (line.c.vec.x > 0 ? 1 : -1);
      } else {
        dx = -cellPos.gx + (line.c.vec.x > 0 ? gridSize : -1);
      }
      if (cellPos.y < 0) {
        dy = (gridSize + cellPos.gy) * (line.c.vec.y > 0 ? 1 : -1);
      } else {
        dy = -cellPos.gy + (line.c.vec.y > 0 ? gridSize : -1);
      }
      return { x: dx, y: dy };
    }
  };
  function getCellPosAndOffset(px, py, gridSize) {
    let { x, y } = getCellPos(px, py, gridSize);
    return {
      x,
      y,
      gx: px - gridSize * x,
      gy: py - gridSize * y
    };
  }
  function getCellPos(x, y, gridSize) {
    return {
      x: getCellCor(x, gridSize),
      y: getCellCor(y, gridSize)
    };
  }
  function getCellCor(x, gridSize) {
    return Math.floor(x / gridSize);
  }
  function getBox(x1, y1, x2, y2) {
    let left = Math.min(x1, x2);
    let right = Math.max(x1, x2);
    let top = Math.min(y1, y2);
    let bottom = Math.max(y1, y2);
    return {
      left,
      right,
      top,
      bottom,
      corners: [
        [left, top],
        [left, bottom],
        [right, top],
        [right, bottom]
      ].map((c) => {
        return { x: c[0], y: c[1] };
      })
    };
  }
  function inBounds(p, box) {
    return p.x >= box.left && p.x <= box.right && p.y >= box.top && p.y <= box.bottom;
  }

  // src/line-rider-engine/grids/ClassicGrid.js
  var GRID_SIZE = 14;
  var LineCellsMap = class extends map_default {
    add(line, cells) {
      this.set(line.id, cells);
    }
    remove(line) {
      let cells = this.get(line.id);
      if (!cells) return [];
      this.delete(line.id);
      return cells;
    }
  };
  var CellLinesMap = class extends map_default {
    add(line, cells) {
      for (let cell of cells) {
        let cellLines = this.get(cell);
        if (!cellLines) {
          cellLines = new OrderedObjectArray("id", true);
          this.set(cell, cellLines);
        }
        cellLines.add(line);
      }
    }
    remove(line, cells) {
      for (let cell of cells) {
        let cellLines = this.get(cell);
        cellLines.remove(line);
        if (cellLines.length === 0) {
          this.delete(cell);
        }
      }
    }
  };
  var ClassicGrid = class {
    constructor(getCellFn = classicCells) {
      this.getCellsFromLine = getCellFn;
      this.lineCellsMap = new LineCellsMap();
      this.cellLinesMap = new CellLinesMap();
    }
    add(line) {
      if (!line.collidable) return [];
      let cells = this.getCellsFromLine(line, GRID_SIZE);
      this.lineCellsMap.add(line, cells);
      this.cellLinesMap.add(line, cells);
      return cells;
    }
    remove(line) {
      let cells = this.lineCellsMap.remove(line);
      this.cellLinesMap.remove(line, cells);
    }
    // 3x3 grid around entity
    getCellsNearEntity(entity) {
      let gx = Math.floor(entity.pos.x / GRID_SIZE);
      let gy = Math.floor(entity.pos.y / GRID_SIZE);
      let cells = [];
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          cells.push(hashIntPair(i + gx, j + gy));
        }
      }
      return cells;
    }
    // the lines in the 3x3 grid around entity, with duplicates
    getLinesNearEntity(entity) {
      let lines = [];
      let cells = this.getCellsNearEntity(entity);
      for (let cell of cells) {
        let cellLines = this.cellLinesMap.get(cell);
        if (!cellLines) continue;
        for (let line of cellLines) {
          lines.push(line);
        }
      }
      return lines;
    }
  };

  // src/line-rider-engine/LineRiderEngine.js
  var LineRiderEngine = class extends LineEngine {
    __props__() {
      return {
        iterations: ITERATE,
        stepOptions: {
          gravity: GRAVITY
        },
        rider: this.makeRider()
      };
    }
    __state__() {
      return {
        start: {
          position: DEFAULT_START_POSITION,
          velocity: DEFAULT_START_VELOCITY
        }
      };
    }
    __computed__() {
      return {
        lineSpace: new LineSpace(({ p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } }) => [x1, y1, x2, y2])
      };
    }
    /* public */
    // getLastFrameIndex ()
    // getLine (id)
    // getMaxLineID ()
    // addLine (line)
    // removeLine (line)
    constructor() {
      super();
      return this.setStart().setConstraints(this.rider.constraints);
    }
    setStart(position = DEFAULT_START_POSITION, velocity = DEFAULT_START_VELOCITY) {
      return this.updateState({
        start: {
          position,
          velocity
        }
      }).setInitialStates(this.rider.makeStateArray(position, velocity));
    }
    getRider(frameIndex) {
      return this.rider.getBody(this.getStateMapAtFrame(frameIndex));
    }
    toJSON() {
      this.linesList.__getBuffer();
      return {
        start: this.start,
        lines: this.linesList.buffer.map((line) => line.toJSON())
      };
    }
    /* private */
    _addLine(line) {
      super._addLine(line);
      this.lineSpace.addLine(line);
    }
    _removeLine(line) {
      super._removeLine(line);
      this.lineSpace.removeLine(line);
    }
    makeRider() {
      return new Rider();
    }
    makeGrid(...args) {
      return new ClassicGrid(...args);
    }
    selectLinesInBox(x0, y0, x1, y1) {
      this.updateComputed();
      return this.lineSpace.selectLinesInBox(x0, y0, x1, y1);
    }
    selectLinesInRadius(c, r) {
      this.updateComputed();
      return this.lineSpace.selectLinesInRadius(c, r);
    }
    selectClosestLineInRadius(c, r) {
      this.updateComputed();
      return this.lineSpace.selectClosestLineInRadius(c, r);
    }
    getBoundingBox() {
      this.updateComputed();
      return this.lineSpace.getBoundingBox();
    }
  };
  setupImmo(LineRiderEngine);

  // src/line-rider-engine/lines/LineTypes.js
  var LineTypes_default = {
    SOLID: 0,
    ACC: 1,
    SCENERY: 2
  };

  // src/line-rider-engine/lines/Line.js
  var Line = class {
    constructor({ id, x1, y1, x2, y2 }) {
      this.id = id;
      this.p1 = v2_default({ x: x1, y: y1 });
      this.p2 = v2_default({ x: x2, y: y2 });
    }
    get collidable() {
      return false;
    }
    get x1() {
      return this.p1.x;
    }
    get y1() {
      return this.p1.y;
    }
    get x2() {
      return this.p2.x;
    }
    get y2() {
      return this.p2.y;
    }
    get vec() {
      return v2_default(this.p2).sub(this.p1);
    }
    get lengthSq() {
      return this.vec.lenSq();
    }
    get invLengthSq() {
      return 1 / this.lengthSq;
    }
    get length() {
      return Math.sqrt(this.lengthSq);
    }
    get invLength() {
      return 1 / this.length;
    }
    get norm() {
      return v2_default(this.vec).rotCW().mul(this.invLength * (this.flipped ? -1 : 1));
    }
    equals(line) {
      return this.id === line.id && this.type === line.type && this.p1.equals(line.p1) && this.p2.equals(line.p2);
    }
    toJSON() {
      return {
        id: this.id,
        type: this.type,
        x1: this.p1.x,
        y1: this.p1.y,
        x2: this.p2.x,
        y2: this.p2.y
      };
    }
  };

  // src/line-rider-engine/lines/SolidLine.js
  var MAX_FORCE_LENGTH = 10;
  var MIN_EXTENSION_RATIO = 0.25;
  var SolidLine = class extends Line {
    constructor(data) {
      super(data);
      this.flipped = data.flipped || false;
      this.leftExtended = data.leftExtended || false;
      this.rightExtended = data.rightExtended || false;
      this.c = this.getComputed();
    }
    collidesWith(p) {
      let offset = this.offset(p);
      return this.shouldCollide(p, this.perpComp(offset), this.linePos(offset));
    }
    collide(p) {
      let offset = this.offset(p);
      let perpComp = this.perpComp(offset);
      let linePos = this.linePos(offset);
      if (this.shouldCollide(p, perpComp, linePos)) {
        let pos = v2_default(this.c.norm).mul(perpComp).sub(p.pos).mul(-1);
        let v = v2_default(this.c.norm).rotCCW().mul(p.friction).mul(perpComp);
        if (p.prevPos.x >= pos.x) {
          v.x *= -1;
        }
        if (p.prevPos.y < pos.y) {
          v.y *= -1;
        }
        v.add(p.prevPos);
        return this.doCollide(p, pos, v);
      }
      return null;
    }
    get type() {
      return LineTypes_default.SOLID;
    }
    get collidable() {
      return true;
    }
    get extension() {
      return Math.min(MIN_EXTENSION_RATIO, MAX_FORCE_LENGTH / this.length);
    }
    get leftBound() {
      return this.leftExtended ? -this.extension : 0;
    }
    get rightBound() {
      return this.rightExtended ? 1 + this.extension : 1;
    }
    getComputed() {
      let { vec, norm, invLengthSq, length, extension, leftBound, rightBound } = this;
      return { vec, norm, invLengthSq, length, extension, leftBound, rightBound };
    }
    offset(p) {
      return v2_default(p.pos).sub(this.p1);
    }
    // perpendicular component
    perpComp(offset) {
      return this.c.norm.dot(offset);
    }
    // normalized parallel component
    // or closest relative position on the line to the point
    // this is the slowest function
    // so maybe come up with a faster boundary checking algo
    linePos(offset) {
      return this.c.vec.dot(offset) * this.c.invLengthSq;
    }
    shouldCollide(p, perpComp, linePos) {
      let pntDirection = this.c.norm.dot(p.vel);
      let pointMovingIntoLine = pntDirection > 0;
      let pointInForceBounds = perpComp > 0 && perpComp < MAX_FORCE_LENGTH && linePos >= this.c.leftBound && linePos <= this.c.rightBound;
      return pointMovingIntoLine && pointInForceBounds;
    }
    doCollide(p, pos, prevPos) {
      return p.updateState({ pos, prevPos });
    }
    equals(line) {
      return super.equals(line) && this.flipped === line.flipped && this.leftExtended === line.leftExtended && this.rightExtended === line.rightExtended;
    }
    toJSON() {
      let { flipped, leftExtended, rightExtended } = this;
      return Object.assign(super.toJSON(), { flipped, leftExtended, rightExtended });
    }
  };

  // src/line-rider-engine/lines/AccLine.js
  var ACC = 0.1;
  var AccLine = class extends SolidLine {
    constructor(data) {
      super(data);
      this.c.acc = this.acc;
    }
    get type() {
      return LineTypes_default.ACC;
    }
    get acc() {
      return v2_default(this.norm).rotCW().mul(ACC * (this.flipped ? -1 : 1));
    }
    doCollide(p, pos, prevPos) {
      prevPos.add(this.c.acc);
      return p.updateState({ pos, prevPos });
    }
  };

  // src/line-rider-engine/lines/SceneryLine.js
  var SolidLine2 = class extends Line {
    constructor(data) {
      super(data);
    }
    get type() {
      return LineTypes_default.SCENERY;
    }
  };

  // src/line-rider-engine/lines/index.js
  var LEFT_EXTENDED = 1;
  var RIGHT_EXTENDED = 2;
  function createLineFromJson(data) {
    if (data.extended) {
      data.leftExtended = !!(LEFT_EXTENDED & data.extended);
      data.rightExtended = !!(RIGHT_EXTENDED & data.extended);
    }
    switch (data.type) {
      case void 0:
        throw new TypeError(`Line JSON requires type: ${data.toString()}`);
      case LineTypes_default.SOLID:
        return new SolidLine(data);
      case LineTypes_default.ACC:
        return new AccLine(data);
      case LineTypes_default.SCENERY:
        return new SolidLine2(data);
      default:
        console.warn(`Line JSON has unknown type, creating as scenery line: ${data.toString()}`);
    }
  }

  // entry.js
  window.LR = { Engine: LineRiderEngine, createLineFromJson };
})();
