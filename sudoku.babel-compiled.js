'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var View = function () {
	function View() {
		_classCallCheck(this, View);
	}

	_createClass(View, null, [{
		key: 'renderField',
		value: function renderField() {
			var _this = this;

			var field = document.createElement('div');
			field.classList.add('field');
			field.getCell = function (x, y) {
				return _this.getCell(x, y, field);
			};
			var triada = this.renderTriada();
			for (var i = 0; i < 9; i++) {
				field.appendChild(triada.cloneNode(true));
			}
			var button = this.renderButton();
			button.addEventListener("click", function () {
				return field.run();
			});
			field.appendChild(button);
			field.popup = this.renderPopup();
			field.appendChild(field.popup);
			document.body.appendChild(field);
			return field;
		}
	}, {
		key: 'getCell',
		value: function getCell(x, y, field) {
			var triada = parseInt(y / 3) * 3 + parseInt(x / 3) + 1;
			var num = y % 3 * 3 + x % 3 + 1;
			return field.querySelector('.triada:nth-child(' + triada + ') .cell:nth-child(' + num + ')');
		}
	}, {
		key: 'renderTriada',
		value: function renderTriada() {
			var triada = document.createElement('div');
			triada.classList.add('triada');
			var cell = this.renderCell();
			for (var i = 0; i < 9; i++) {
				triada.appendChild(cell.cloneNode(true));
			}
			return triada;
		}
	}, {
		key: 'renderCell',
		value: function renderCell() {
			var cell = document.createElement('div');
			cell.classList.add('cell');
			var cellPossibleVal = document.createElement('div');
			cellPossibleVal.classList.add('cell-possible-val');
			for (var i = 1; i <= 9; i++) {
				cellPossibleVal.innerHTML = i;
				cell.appendChild(cellPossibleVal.cloneNode(true));
			}
			var cellValue = document.createElement('div');
			cellValue.classList.add('cell-val');
			cellValue.appendChild(document.createTextNode(''));
			cell.appendChild(cellValue);
			return cell;
		}
	}, {
		key: 'renderPopup',
		value: function renderPopup() {
			var popup = document.createElement('div');
			popup.classList.add('popup');
			var close = document.createElement('div');
			close.classList.add('close');
			close.appendChild(document.createTextNode('x'));
			close.addEventListener("click", function () {
				return popup.classList.toggle('active');
			});
			popup.appendChild(close);
			var numbers = document.createElement('div');
			numbers.classList.add('numbers');

			var _loop = function _loop(i) {
				var num = document.createElement('div');
				num.appendChild(document.createTextNode(i));
				num.addEventListener("click", function () {
					popup.classList.toggle('active');
					popup.cell.val = i;
				});
				numbers.appendChild(num);
			};

			for (var i = 1; i <= 9; i++) {
				_loop(i);
			}
			popup.appendChild(numbers);
			var del = document.createElement('div');
			del.appendChild(document.createTextNode('Del'));
			del.classList.add('clear');
			del.addEventListener("click", function () {
				popup.classList.toggle('active');
				popup.cell.val = '';
			});
			popup.appendChild(del);
			return popup;
		}
	}, {
		key: 'renderButton',
		value: function renderButton() {
			var button = document.createElement('input');
			button.type = 'button';
			button.value = 'Try to Solve!';
			return button;
		}
	}]);

	return View;
}();

var CellView = function () {
	function CellView(cell, field) {
		_classCallCheck(this, CellView);

		this.model = cell;
		this.dom = field.getCell(cell.x, cell.y);
		this.dom.addEventListener("click", function () {
			field.popup.classList.toggle('active');
			field.popup.cell = cell;
		});
	}

	_createClass(CellView, [{
		key: 'update',
		value: function update() {
			var cellValue = this.dom.querySelector('.cell-val');
			cellValue.replaceChild(document.createTextNode(this.model.val), cellValue.firstChild);
			this.updatePossibility();
		}
	}, {
		key: 'updatePossibility',
		value: function updatePossibility() {
			for (var n = 1; n <= 9; n++) {
				var possCell = this.dom.querySelector('.cell-possible-val:nth-child(' + n + ')');
				possCell.style.visibility = this.model.possibleNumbers.has(n) ? 'visible' : 'hidden';
			}
		}
	}, {
		key: 'dom',
		get: function get() {
			return this[Symbol.for("dom")];
		},
		set: function set(domObject) {
			this[Symbol.for("dom")] = domObject;
		}
	}]);

	return CellView;
}();

var Cell = function () {
	function Cell(x, y) {
		_classCallCheck(this, Cell);

		this.x = x;
		this.y = y;
		this.possibleNumbers = new Set(this.defaultPossibleNumbers);
		this.possibleNumbersMask = 255;
	}

	_createClass(Cell, [{
		key: 'recalcPossibility',
		value: function recalcPossibility() {
			var possibleNumbers = new Set(this.defaultPossibleNumbers);
			var values = Array.concat(this.vertical.values, this.horizontal.values, this.triads.values);
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var val = _step.value;

					possibleNumbers.delete(val);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return possibleNumbers;
		}
	}, {
		key: 'resetPosisbilityMask',
		value: function resetPosisbilityMask() {
			var mask = 0;
			this.possibleNumbers.forEach(function (value, valueAgain, set) {
				mask |= Math.pow(2, value - 1);
			});
			this.possibleNumbersMask = mask;
		}
	}, {
		key: 'resetPossibility',
		value: function resetPossibility() {
			if (this.val) {
				this.possibleNumbers.clear();
			} else {
				this.possibleNumbers = this.recalcPossibility();
			}
			if (this.solver) {
				if (this.possibleNumbers.size == 1) {
					this.solver.addCell(this);
				} else {
					this.solver.removeCell(this);
				}
			}
			this.resetPosisbilityMask();
			if (this.onPossibilityChange) this.onPossibilityChange();
		}
	}, {
		key: 'removePossible',
		value: function removePossible(value) {
			if (this.possibleNumbers.delete(value)) {
				if (this.solver && this.possibleNumbers.size == 1) {
					this.solver.addCell(this);
				}
				this.resetPosisbilityMask();
				if (this.onPossibilityChange) this.onPossibilityChange();
			}
		}
	}, {
		key: 'setLastPossibleValue',
		value: function setLastPossibleValue() {
			if (this.possibleNumbers.size == 1) {
				var possibleIter = this.possibleNumbers.values();
				this.val = possibleIter.next().value;
			}
		}
	}, {
		key: 'attachCollection',
		value: function attachCollection(collection, index) {
			if (!(collection[index] instanceof Collection)) {
				collection[index] = new Collection();
			}
			collection[index].append(this);
			return collection[index];
		}
	}, {
		key: 'attachCollections',
		value: function attachCollections(collections) {
			this.vertical = this.attachCollection(collections.vertical, this.x);
			this.horizontal = this.attachCollection(collections.horizontal, this.y);
			var t = parseInt(this.y / 3) * 3 + parseInt(this.x / 3);
			this.triads = this.attachCollection(collections.triads, t);
		}
	}, {
		key: 'attachView',
		value: function attachView(view) {
			this.view = view;
		}
	}, {
		key: 'attachSolver',
		value: function attachSolver(solver) {
			this.solver = solver;
		}
	}, {
		key: 'defaultPossibleNumbers',
		get: function get() {
			return [1, 2, 3, 4, 5, 6, 7, 8, 9];
		}
	}, {
		key: 'val',
		get: function get() {
			return this[Symbol.for("val")];
		},
		set: function set(value) {
			if (value) {
				if (this.val) {
					if (this.recalcPossibility().has(value)) {
						this[Symbol.for("val")] = value;
						this.horizontal.resetPossibility();
						this.vertical.resetPossibility();
						this.triads.resetPossibility();
					} else {
						return false;
					}
				} else if (this.possibleNumbers.has(value)) {
					this[Symbol.for("val")] = value;
					this.possibleNumbers.clear();
					this.horizontal.removePossible(value);
					this.vertical.removePossible(value);
					this.triads.removePossible(value);
				} else {
					return false;
				}
			} else {
				this[Symbol.for("val")] = value;
				this.horizontal.resetPossibility();
				this.vertical.resetPossibility();
				this.triads.resetPossibility();
			}
			if (this.onChange) this.onChange();
			return true;
		}
	}]);

	return Cell;
}();

var Collection = function () {
	function Collection() {
		var values = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

		_classCallCheck(this, Collection);

		this[Symbol.for("list")] = values;
	}

	_createClass(Collection, [{
		key: 'append',
		value: function append(value) {
			this.list.push(value);
		}
	}, {
		key: 'get',
		value: function get(num) {
			return this.list[num];
		}
	}, {
		key: 'removePossible',
		value: function removePossible(value) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var cell = _step2.value;

					cell.removePossible(value);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	}, {
		key: 'resetPossibility',
		value: function resetPossibility() {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var cell = _step3.value;

					if (!cell.val) {
						cell.resetPossibility();
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}, {
		key: 'list',
		get: function get() {
			return this[Symbol.for("list")];
		}
	}, {
		key: 'values',
		get: function get() {
			var values = [];
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.list[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var cell = _step4.value;

					var val = cell.val;
					if (val) values.push(val);
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return values;
		}
	}]);

	return Collection;
}();

var Solver = function () {
	function Solver(table) {
		_classCallCheck(this, Solver);

		this.singleStack = [];
		this.table = table;
	}

	_createClass(Solver, [{
		key: 'addCell',
		value: function addCell(cell) {
			this.singleStack.push(cell);
		}
	}, {
		key: 'removeCell',
		value: function removeCell(cell) {
			var position = this.singleStack.indexOf(cell);
			if (position != -1) this.singleStack.splice(position, 1);
		}
	}, {
		key: 'run',
		value: function run() {
			do {
				while (this.singleStack.length) {
					var cell = this.singleStack.pop();
					cell.setLastPossibleValue();
				}
				for (var collectionListKey in this.table.collections) {
					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = this.table.collections[collectionListKey][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							var collection = _step5.value;

							this.findUniqueValues(collection);
							this.findTwinsPossibility(collection);
							if (collectionListKey != 'triads') {
								this.findTriadsPossibility(collection);
							}
						}
					} catch (err) {
						_didIteratorError5 = true;
						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5.return) {
								_iterator5.return();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}
				}
			} while (this.singleStack.length);
		}
	}, {
		key: 'findTriadsPossibility',
		value: function findTriadsPossibility(collection) {
			var notFilledCells = [];
			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = collection.list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var _cell = _step6.value;

					if (!_cell.val) notFilledCells.push(_cell);
					if (notFilledCells.length > 3) break;
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}

			if (notFilledCells.length == 3) {
				var isCellsFromSameTriads = notFilledCells[0].triads == notFilledCells[1].triads && notFilledCells[2].triads == notFilledCells[1].triads;
				if (isCellsFromSameTriads) {
					var values = [];
					var filledValues = collection.values;
					for (var i = 1; i <= 9; i++) {
						if (filledValues.indexOf(i) == -1) {
							values.push(i);
						}
					}
					var _iteratorNormalCompletion7 = true;
					var _didIteratorError7 = false;
					var _iteratorError7 = undefined;

					try {
						for (var _iterator7 = notFilledCells[0].triads.list[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
							var cell = _step7.value;

							if (cell.vertical != collection && cell.horizontal != collection && !cell.val) {
								var _iteratorNormalCompletion8 = true;
								var _didIteratorError8 = false;
								var _iteratorError8 = undefined;

								try {
									for (var _iterator8 = values[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
										var possibleValue = _step8.value;

										cell.removePossible(possibleValue);
									}
								} catch (err) {
									_didIteratorError8 = true;
									_iteratorError8 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion8 && _iterator8.return) {
											_iterator8.return();
										}
									} finally {
										if (_didIteratorError8) {
											throw _iteratorError8;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError7 = true;
						_iteratorError7 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion7 && _iterator7.return) {
								_iterator7.return();
							}
						} finally {
							if (_didIteratorError7) {
								throw _iteratorError7;
							}
						}
					}
				}
			}
		}
	}, {
		key: 'findTwinsPossibility',
		value: function findTwinsPossibility(collection) {
			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = collection.list[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var checkedCell = _step9.value;

					if (checkedCell.val) continue;
					var _iteratorNormalCompletion10 = true;
					var _didIteratorError10 = false;
					var _iteratorError10 = undefined;

					try {
						for (var _iterator10 = collection.list[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
							var cell = _step10.value;

							if (cell.val) continue;
							if (checkedCell != cell) {
								if (cell.possibleNumbers.size == 2 && cell.possibleNumbersMask == checkedCell.possibleNumbersMask) {
									var _iteratorNormalCompletion11 = true;
									var _didIteratorError11 = false;
									var _iteratorError11 = undefined;

									try {
										for (var _iterator11 = collection.list[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
											var cellForClear = _step11.value;

											var isNeedPosibilityClear = !cellForClear.val && cellForClear != cell && cellForClear != checkedCell && cellForClear.possibleNumbers.size > 2;
											if (isNeedPosibilityClear) {
												var possibleIter = checkedCell.possibleNumbers.values();
												cellForClear.removePossible(possibleIter.next().value);
												cellForClear.removePossible(possibleIter.next().value);
											}
										}
									} catch (err) {
										_didIteratorError11 = true;
										_iteratorError11 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion11 && _iterator11.return) {
												_iterator11.return();
											}
										} finally {
											if (_didIteratorError11) {
												throw _iteratorError11;
											}
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError10 = true;
						_iteratorError10 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion10 && _iterator10.return) {
								_iterator10.return();
							}
						} finally {
							if (_didIteratorError10) {
								throw _iteratorError10;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9.return) {
						_iterator9.return();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}
		}
	}, {
		key: 'findUniqueValues',
		value: function findUniqueValues(collection) {
			var _iteratorNormalCompletion12 = true;
			var _didIteratorError12 = false;
			var _iteratorError12 = undefined;

			try {
				for (var _iterator12 = collection.list[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
					var cell = _step12.value;

					var mask = cell.possibleNumbersMask;
					if (cell.val) continue;
					if (cell.possibleNumbers.size < 2) continue;
					var _iteratorNormalCompletion13 = true;
					var _didIteratorError13 = false;
					var _iteratorError13 = undefined;

					try {
						for (var _iterator13 = collection.list[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
							var cellIteration = _step13.value;

							if (cellIteration.val) continue;
							if (cellIteration != cell) {
								mask = mask & ~cellIteration.possibleNumbersMask; //implication;
							}
						}
					} catch (err) {
						_didIteratorError13 = true;
						_iteratorError13 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion13 && _iterator13.return) {
								_iterator13.return();
							}
						} finally {
							if (_didIteratorError13) {
								throw _iteratorError13;
							}
						}
					}

					if (mask) {
						var val = Math.log2(mask) + 1;
						if (!(val % 1)) {
							cell.possibleNumbers.clear();
							cell.possibleNumbers.add(val);
							this.singleStack.push(cell);
						}
					}
				}
			} catch (err) {
				_didIteratorError12 = true;
				_iteratorError12 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion12 && _iterator12.return) {
						_iterator12.return();
					}
				} finally {
					if (_didIteratorError12) {
						throw _iteratorError12;
					}
				}
			}
		}
	}]);

	return Solver;
}();

var Engine = function () {
	function Engine() {
		_classCallCheck(this, Engine);

		this.collections = {
			vertical: [],
			horizontal: [],
			triads: []
		};

		this.solver = new Solver(this);

		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var cell = new Cell(j, i);
				cell.attachCollections(this.collections);
				cell.attachSolver(this.solver);
			}
		}
	}

	_createClass(Engine, [{
		key: 'attachView',
		value: function attachView() {
			var _this2 = this;

			var field = View.renderField();
			field.run = function () {
				return _this2.solver.run();
			};

			for (var i = 0; i < 9; i++) {
				var _loop2 = function _loop2(j) {
					var cell = _this2.getXY(j, i);
					var cellView = new CellView(cell, field);
					cell.onChange = function () {
						return cellView.update();
					};
					cell.onPossibilityChange = function () {
						return cellView.updatePossibility();
					};
				};

				for (var j = 0; j < 9; j++) {
					_loop2(j);
				}
			}
		}
	}, {
		key: 'getXY',
		value: function getXY(x, y) {
			return this.collections.vertical[x].get(y);
		}
	}, {
		key: 'values',
		set: function set(values) {
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 9; j++) {
					if (values[i][j]) this.getXY(j, i).val = values[i][j];
				}
			}
		}
	}]);

	return Engine;
}();

/*

 [
 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],

 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],

 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],
 ];


 */

var tbl = [[0, 5, 4, 7, 6, 8, 0, 0, 0], [0, 9, 0, 0, 0, 3, 0, 0, 0], [8, 0, 0, 0, 0, 0, 0, 0, 0], [7, 0, 0, 0, 9, 6, 0, 0, 0], [0, 2, 5, 3, 0, 4, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 8, 0, 5, 0, 6, 2, 0], [0, 0, 9, 0, 0, 0, 4, 0, 0], [0, 0, 0, 1, 0, 0, 7, 9, 0]]; /* [
 [0,5,4,  7,6,8,  0,0,0],
 [0,9,0,  0,0,3,  0,0,0],
 [8,0,0,  0,0,0,  0,0,0],
 [7,0,0,  0,9,6,  0,0,0],
 [0,2,5,  3,0,4,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],
 [1,0,8,  0,5,0,  6,2,0],
 [0,0,9,  0,0,0,  4,0,0],
 [0,0,0,  1,0,0,  7,9,0],
 ];    /*  [

 [7,0,0,  0,0,0,  1,0,0],
 [9,0,5,  0,0,7,  0,2,0],
 [1,0,0,  3,2,0,  0,0,9],
 [0,0,0,  8,5,0,  0,4,0],
 [0,0,8,  0,3,0,  0,5,0],
 [0,0,0,  7,9,0,  0,1,0],
 [4,0,0,  5,6,0,  0,0,8],
 [8,0,2,  0,0,1,  0,3,0],
 [5,0,0,  0,0,0,  4,0,0],
 ];/*[
 [0,0,8,  0,7,3,  0,0,4],
 [0,6,0,  0,0,0,  0,2,7],
 [0,0,0,  1,0,0,  0,6,0],
 [0,0,2,  0,0,7,  4,0,0],
 [0,0,0,  0,0,0,  0,8,2],
 [0,4,0,  8,1,0,  7,0,0],
 [1,0,0,  0,9,0,  0,0,0],
 [0,0,6,  0,0,0,  2,0,1],
 [0,8,0,  7,4,0,  6,0,0],
 ];     /*  [
 [0,0,5,  3,0,0,  0,0,0],
 [8,0,0,  0,0,0,  0,2,0],
 [0,7,0,  0,1,0,  5,0,0],
 [4,0,0,  0,0,5,  3,0,0],
 [0,1,0,  0,7,0,  0,0,6],
 [0,0,3,  2,0,0,  0,8,0],
 [0,6,0,  5,0,0,  0,0,9],
 [0,0,4,  0,0,0,  0,3,0],
 [0,0,0,  0,0,9,  7,0,0],
 ];  /*      [
 [0,5,0,  0,0,0,  1,0,0],
 [6,0,0,  0,0,8,  0,0,5],
 [3,8,0,  0,4,0,  0,0,9],
 [0,0,0,  0,0,0,  0,0,0],
 [9,0,0,  2,0,0,  7,0,0],
 [0,0,0,  5,7,1,  0,0,6],
 [0,0,0,  7,5,2,  4,0,1],
 [0,0,0,  9,0,0,  3,0,0],
 [0,0,0,  0,1,0,  0,2,0],
 ];
 /**
 [
 [0,5,4,  7,6,8,  0,0,0],
 [0,9,0,  0,0,3,  0,0,0],
 [8,0,0,  0,0,0,  0,0,0],
 [7,0,0,  0,9,6,  0,0,0],
 [0,2,5,  3,0,4,  0,0,0],
 [0,0,0,  0,0,0,  0,0,0],
 [1,0,8,  0,5,0,  6,2,0],
 [0,0,9,  0,0,0,  4,0,0],
 [0,0,0,  1,0,0,  7,9,0],
 ];
 /*[
 [0,0,0,  0,0,0,  0,0,0],
 [0,0,0,  0,7,0,  0,9,4],
 [0,0,0,  4,0,6,  7,0,8],
 [0,0,0,  8,0,2,  0,1,6],
 [0,0,0,  0,0,0,  0,0,3],
 [0,0,6,  1,0,0,  5,0,0],
 [0,2,9,  0,0,3,  0,0,5],
 [0,0,7,  0,2,0,  0,6,0],
 [0,8,0,  0,0,5,  4,0,0],
 ];       /** [
 [0,5,0,  0,0,0,  1,0,0],
 [6,0,0,  0,0,8,  0,0,5],
 [3,8,0,  0,4,0,  0,0,9],
 [0,0,0,  0,0,0,  0,0,0],
 [9,0,0,  2,0,0,  7,0,0],
 [0,0,0,  5,7,1,  0,0,6],
 [0,0,0,  7,5,2,  4,0,1],
 [0,0,0,  9,0,0,  3,0,0],
 [0,0,0,  0,1,0,  0,2,0],
 ];/**/

var e = new Engine();
e.attachView();
e.values = tbl;