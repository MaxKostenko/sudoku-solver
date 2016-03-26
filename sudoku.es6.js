class View {

	static renderField() {
		let field = document.createElement('div');
		field.classList.add( 'field' );
		field.getCell = ( x, y ) => this.getCell( x, y, field )
		let triada = this.renderTriada();
		for(let i=0; i<9; i++) {
			field.appendChild( triada.cloneNode(true) );
		}
		let button = this.renderButton();
		button.addEventListener("click", () => field.run() );
		field.appendChild(button);
		field.popup = this.renderPopup();
		field.appendChild(field.popup);
		document.body.appendChild( field );
		return field;
	}

	static getCell( x, y, field ) {
		let triada = parseInt(y/3)*3 + parseInt(x/3) + 1;
		let num = (y%3)*3 + x%3 + 1;
		return field.querySelector(`.triada:nth-child(${triada}) .cell:nth-child(${num})`);
	}

	static renderTriada() {
		let triada = document.createElement('div');
		triada.classList.add( 'triada' );
		let cell =  this.renderCell();
		for(let i=0; i<9; i++) {
			triada.appendChild( cell.cloneNode(true) );
		}
		return triada;

	}

	static renderCell() {
		let cell = document.createElement('div');
		cell.classList.add('cell');
		let cellPossibleVal = document.createElement('div');
		cellPossibleVal.classList.add('cell-possible-val');
		for(let i=1; i<=9; i++) {
			cellPossibleVal.innerHTML = i;
			cell.appendChild( cellPossibleVal.cloneNode(true) );
		}
		let cellValue = document.createElement('div');
		cellValue.classList.add('cell-val');
		cellValue.appendChild(document.createTextNode(''));
		cell.appendChild(cellValue);
		return cell;
	}

	static renderPopup() {
		let popup = document.createElement('div');
		popup.classList.add('popup');
		let close = document.createElement('div');
		close.classList.add('close');
		close.appendChild(document.createTextNode('x'));
		close.addEventListener("click", () => popup.classList.toggle('active') );
		popup.appendChild(close);
		let numbers = document.createElement('div');
		numbers.classList.add('numbers');
		for(let i=1; i<=9; i++) {
			let num = document.createElement('div');
			num.appendChild(document.createTextNode(i));
			num.addEventListener("click", () => {
				popup.classList.toggle('active');
			popup.cell.val = i;
		});
		numbers.appendChild(num);
	}
	popup.appendChild(numbers);
	let del = document.createElement('div');
	del.appendChild(document.createTextNode('Del'));
	del.classList.add('clear');
	del.addEventListener("click", () => {
		popup.classList.toggle('active');
	popup.cell.val = '';
});
popup.appendChild(del);
return popup;
}

static renderButton() {
	let button = document.createElement('input');
	button.type = 'button';
	button.value = 'Try to Solve!';
	return button;

}
}

class CellView {

	constructor( cell, field ) {
		this.model = cell;
		this.dom = field.getCell( cell.x, cell.y );
		this.dom.addEventListener("click", () => {
			field.popup.classList.toggle('active');
		field.popup.cell = cell;
	} );
}

get dom() {
	return this[Symbol.for("dom")];
}

set dom(domObject) {
	this[Symbol.for("dom")] = domObject;
}

update() {
	let cellValue = this.dom.querySelector('.cell-val');
	cellValue.replaceChild(document.createTextNode(this.model.val),cellValue.firstChild);
	this.updatePossibility();
}

updatePossibility() {
	for( let n=1; n<=9; n++) {
		let possCell = this.dom.querySelector(`.cell-possible-val:nth-child(${n})`);
		possCell.style.visibility = this.model.possibleNumbers.has(n) ? 'visible' : 'hidden';
	}
}
}


class Cell {

	constructor( x, y ) {
		this.x = x;
		this.y = y;
		this.possibleNumbers = new Set( this.defaultPossibleNumbers );
		this.possibleNumbersMask = 255;
	}

	get defaultPossibleNumbers() {
		return [1,2,3,4,5,6,7,8,9]
	}

	get val() {
		return this[Symbol.for("val")];
	}

	set val( value ) {
		if( value ) {
			if( this.val ) {
				if( this.recalcPossibility().has( value ) ) {
					this[Symbol.for("val")] = value;
					this.horizontal.resetPossibility();
					this.vertical.resetPossibility();
					this.triads.resetPossibility();
				} else {
					return false;
				}
			} else if( this.possibleNumbers.has( value ) ) {
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
		if( this.onChange )
			this.onChange();
		return true;
	}

	recalcPossibility() {
		let possibleNumbers = new Set( this.defaultPossibleNumbers );
		let values = Array.concat(
			this.vertical.values,
			this.horizontal.values,
			this.triads.values );
		for( let val of values ) {
			possibleNumbers.delete( val );
		}
		return possibleNumbers;
	}

	resetPosisbilityMask() {
		let mask = 0;
		this.possibleNumbers.forEach((value, valueAgain, set) => {
			mask |= Math.pow( 2, value-1 );
	});
	this.possibleNumbersMask = mask;
}

resetPossibility() {
	if( this.val ) {
		this.possibleNumbers.clear()
	} else {
		this.possibleNumbers = this.recalcPossibility();
	}
	if( this.solver ) {
		if( this.possibleNumbers.size == 1 ) {
			this.solver.addCell( this );
		} else {
			this.solver.removeCell( this );
		}
	}
	this.resetPosisbilityMask();
	if( this.onPossibilityChange )
		this.onPossibilityChange();
}

removePossible(value) {
	if( this.possibleNumbers.delete(value) ) {
		if( this.solver && this.possibleNumbers.size == 1 ) {
			this.solver.addCell( this );
		}
		this.resetPosisbilityMask();
		if( this.onPossibilityChange )
			this.onPossibilityChange();
	}
}

setLastPossibleValue() {
	if( this.possibleNumbers.size == 1 ) {
		let possibleIter = this.possibleNumbers.values();
		this.val = possibleIter.next().value;
	}
}

attachCollection( collection, index ) {
	if( !( collection[index] instanceof Collection ) ) {
		collection[index] = new Collection;
	}
	collection[index].append(this);
	return collection[index];
}

attachCollections(collections) {
	this.vertical = this.attachCollection( collections.vertical, this.x );
	this.horizontal = this.attachCollection( collections.horizontal, this.y );
	let t = parseInt(this.y/3)*3 + parseInt(this.x/3);
	this.triads = this.attachCollection( collections.triads, t );
}

attachView(view) {
	this.view = view;
}

attachSolver( solver ) {
	this.solver = solver;
}
}

class Collection {
	constructor(values = []){
		this[Symbol.for("list")] = values;
	}

	get list() {
		return this[Symbol.for("list")];
	}

	append(value) {
		this.list.push(value);
	}

	get(num) {
		return this.list[num];
	}

	removePossible(value) {
		for( let cell of this.list ) {
			cell.removePossible(value);
		}
	}

	get values() {
		let values = [];
		for( let cell of this.list ) {
			let val = cell.val;
			if( val )
				values.push( val );
		}
		return values;
	}

	resetPossibility() {
		for( let cell of this.list ) {
			if(!cell.val) {
				cell.resetPossibility()
			}
		}
	}
}

class Solver {
	constructor(table) {
		this.singleStack = [];
		this.table = table;
	}

	addCell( cell ) {
		this.singleStack.push( cell );
	}

	removeCell( cell ) {
		let position = this.singleStack.indexOf(cell);
		if( position != -1 )
			this.singleStack.splice( position, 1 );
	}

	run() {
		do {
			while( this.singleStack.length ) {
				let cell = this.singleStack.pop();
				cell.setLastPossibleValue();
			}
			for( let collectionListKey in this.table.collections) {
				for( let collection of this.table.collections[collectionListKey] ) {
					this.findUniqueValues(collection);
					this.findTwinsPossibility( collection );
					if( collectionListKey != 'triads' ) {
						this.findTriadsPossibility( collection );
					}
				}
			}
		} while( this.singleStack.length )
	}

	findTriadsPossibility( collection ) {
		let notFilledCells = [];
		for( let cell of collection.list ) {
			if( !cell.val )
				notFilledCells.push( cell );
			if( notFilledCells.length > 3 ) break;
		}
		if( notFilledCells.length == 3 ) {
			let isCellsFromSameTriads =
				( notFilledCells[0].triads == notFilledCells[1].triads ) &&
					( notFilledCells[2].triads == notFilledCells[1].triads );
			if( isCellsFromSameTriads ) {
				let values = [];
				let filledValues = collection.values;
				for( let i=1; i<=9; i++ ) {
					if( filledValues.indexOf(i) == -1 ) {
						values.push(i);
					}
				}
				for( let cell of notFilledCells[0].triads.list ) {
					if( ( cell.vertical != collection ) &&
						( cell.horizontal != collection ) &&
						( !cell.val ) ) {
						for( let possibleValue of values )
						cell.removePossible( possibleValue );
					}
				}
			}
		}
	}

	findTwinsPossibility( collection ) {
		for( let checkedCell of collection.list ) {
			if( checkedCell.val ) continue;
			for( let cell of collection.list ) {
				if( cell.val ) continue;
				if( checkedCell != cell ) {
					if( ( cell.possibleNumbers.size == 2 ) &&
						( cell.possibleNumbersMask == checkedCell.possibleNumbersMask ) ) {
						for( let cellForClear of collection.list ) {
							let isNeedPosibilityClear = ( !cellForClear.val ) &&
								( cellForClear != cell ) &&
								( cellForClear != checkedCell ) &&
								(cellForClear.possibleNumbers.size > 2);
							if( isNeedPosibilityClear ) {
								let possibleIter = checkedCell.possibleNumbers.values();
								cellForClear.removePossible(possibleIter.next().value);
								cellForClear.removePossible(possibleIter.next().value);
							}
						}
					}
				}
			}
		}
	}

	findUniqueValues(collection) {
		for( let cell of collection.list ) {
			let mask = cell.possibleNumbersMask;
			if( cell.val ) continue;
			if( cell.possibleNumbers.size < 2 ) continue;
			for( let cellIteration of collection.list ) {
				if( cellIteration.val ) continue;
				if( cellIteration != cell ){
					mask = mask&~cellIteration.possibleNumbersMask;//implication;
				}
			}
			if( mask ) {
				let val = Math.log2(mask)+1;
				if( !( val % 1 ) ) {
					cell.possibleNumbers.clear();
					cell.possibleNumbers.add(val);
					this.singleStack.push(cell);
				}
			}
		}

	}
}

class Engine {
	constructor() {
		this.collections = {
			vertical: [],
			horizontal: [],
			triads: []
		}

		this.solver = new Solver(this);

		for( let i=0; i<9; i++ ) {
			for( let j=0; j<9; j++ ) {
				let cell = new Cell( j, i );
				cell.attachCollections(this.collections);
				cell.attachSolver( this.solver );
			}
		}
	}


	attachView() {
		let field = View.renderField();
		field.run = () => this.solver.run();

		for( let i=0; i<9; i++ ) {
			for( let j=0; j<9; j++ ) {
				let cell = this.getXY( j, i );
				let cellView = new CellView( cell, field );
				cell.onChange = () => cellView.update();
				cell.onPossibilityChange = () => cellView.updatePossibility();
			}
		}

	}

	getXY( x, y ) {
		return this.collections.vertical[x].get(y);
	}

	set values( values ) {
		for( let i=0; i<9; i++ ) {
			for( let j=0; j<9; j++ ) {
				if( values[i][j] )
					this.getXY( j, i ).val=values[i][j];
			}
		}

	}
}

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

let tbl = [
	[0,5,4,  7,6,8,  0,0,0],
	[0,9,0,  0,0,3,  0,0,0],
	[8,0,0,  0,0,0,  0,0,0],

	[7,0,0,  0,9,6,  0,0,0],
	[0,2,5,  3,0,4,  0,0,0],
	[0,0,0,  0,0,0,  0,0,0],

	[1,0,8,  0,5,0,  6,2,0],
	[0,0,9,  0,0,0,  4,0,0],
	[0,0,0,  1,0,0,  7,9,0],
];/* [
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


let e = new Engine;
e.attachView();
e.values = tbl;





























