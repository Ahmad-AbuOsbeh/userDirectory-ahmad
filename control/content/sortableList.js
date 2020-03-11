﻿class BadgeList {
	constructor(element, badges = []) {
		// sortableList requires Sortable.js
		if (typeof Sortable == 'undefined') throw 'please add Sortable first to use sortableList components';
		this.badges = [];
		this.init(element);
		this.loadItems(badges);
	}

	// will be called to initialize the setting in the constructor
	init(element) {
		if (typeof element == 'string') this.element = document.getElementById(element);
		else this.element = element;
		//this._renderTemplate();
		this.element.classList.add('draggable-list-view');

		this._initEvents();
	}

	// this method allows you to replace the slider image or append to then if appendItems = true
	loadItems(badges, appendItems) {
		if (badges && badges instanceof Array) {
			if (!appendItems && this.badges.length !== 0) {
				// here we want to remove any existing badges since the user of the component don't want to append badges
				this._removeAll();
			}

			for (var i = 0; i < badges.length; i++) {
				this.badges.push(badges[i]);
				let row = document.createElement('div');
				this.injectItemElements(badges[i], this.badges.length - 1, row);
				this.element.appendChild(row);
			}
		}
	}

	// allows you to append a single item or an array of badges
	append(badges) {
		if (!badges) return;
		else if (!(badges instanceof Array) && typeof badges == 'object') badges = [badges];

		this.loadItems(badges, true);
	}

	// remove all badges in list
	clear() {
		this._removeAll();
	}

	// remove all the DOM element and empty the badges array
	_removeAll() {
		this.badges = [];
		this.element.innerHTML = '';
	}

	// append new sortable item to the DOM
	injectItemElements(item, index, divRow) {
		if (!item) throw 'Missing Item';
		divRow.innerHTML = '';
		divRow.setAttribute('arrayIndex', index);

		// Create the required DOM elements
		var moveHandle = document.createElement('span'),
			title = document.createElement('a'),
			tag = document.createElement('span'),
			tagCount = document.createElement('span'),
			edit = document.createElement('span'),
			deleteButton = document.createElement('span');

		// Add the required classes to the elements
		divRow.className = 'd-item clearfix';
		moveHandle.className = 'icon icon-menu cursor-grab';
		title.className = 'ellipsis';

		deleteButton.className = 'btn btn--icon icon icon-cross2';
		title.innerHTML = item.name;

		tag.innerHTML = item.tag;
		tagCount.innerHTML = item.tagCount;

		// Append elements to the DOM
		divRow.appendChild(moveHandle);
		if (item.imageUrl) {
			let img = document.createElement('img');
			img.src = buildfire.imageLib.cropImage(item.imageUrl, { width: 16, height: 16 });
			divRow.appendChild(img);
		}
		divRow.appendChild(title);
		divRow.appendChild(tag);
		divRow.appendChild(tagCount);
		divRow.appendChild(edit);
		divRow.appendChild(deleteButton);

		title.onclick = () => {
			let index = divRow.getAttribute('arrayIndex'); /// it may have bee reordered so get value of current property
			index = parseInt(index);
			this.onItemClick(item, index, divRow);
			return false;
		};

		deleteButton.onclick = () => {
			let index = divRow.getAttribute('arrayIndex'); /// it may have bee reordered so get value of current property
			index = parseInt(index);
			let t = this;
			this.onDeleteItem(item, index, confirmed => {
				if (confirmed) {
					divRow.parentNode.removeChild(divRow);
					t.reIndexRows();
				}
			});
			return false;
		};
	}

	// initialize the generic events
	_initEvents() {
		var me = this;
		var oldIndex = 0;

		// initialize the sort on the container of the badges
		me.sortableList = Sortable.create(me.element, {
			animation: 150,
			onUpdate: function(evt) {
				var newIndex = me._getSortableItemIndex(evt.item);
				var tmp = me.badges.splice(oldIndex, 1)[0];
				me.badges.splice(newIndex, 0, tmp);
				me.reIndexRows();
				me.onOrderChange(tmp, oldIndex, newIndex);
			},
			onStart: function(evt) {
				oldIndex = me._getSortableItemIndex(evt.item);
			}
		});
	}

	reIndexRows() {
		let i = 0;
		this.element.childNodes.forEach(e => {
			e.setAttribute('arrayIndex', i);
			i++;
		});
	}

	// get item index from the DOM sortable elements
	_getSortableItemIndex(item) {
		var index = 0;
		while ((item = item.previousSibling) != null) {
			index++;
		}
		return index;
	}

	_cropImage(url, options) {
		if (!url) {
			return '';
		} else {
			return buildfire.imageLib.cropImage(url, options);
		}
	}

	/* This will be triggered when the order of badges changes
	  Example: if you move the first item location to be the second this will return item object, 0, 1 */
	onOrderChange(item, oldIndex, newIndex) {
		console.warn('please handle onOrderChange', item, oldIndex, newIndex);
	}

	// This will be triggered when you delete an item
	onDeleteItem(item, index) {
		console.error('please handle onDeleteItem', item);
	}

	// This will be triggered when you delete an item
	onItemClick(item, index, divRow) {
		console.error('please handle onItemClick', item);
	}
}

