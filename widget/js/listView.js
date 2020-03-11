class ListView {
	constructor(containerId, options) {
		this.container = document.getElementById(containerId);
		if (!this.container) throw 'Cant find container';
		this.container.classList.add('listViewContainer');
		this.options = options || {};
		this.container.innerHTML = '';
		this.items = [];
	}

	clear() {
		this.container.innerHTML = '';
		this.items = [];
	}
	loadListViewItems(items) {
		this.items = [];
		if (this.container.innerHTML == '') {
			if (this.options.enableAddButton) {
				let addButton = ui.create('button', this.container, '<span></span>', ['listViewAddButton', 'btn', 'btn--add', 'btn--fab', 'btn-primary']);
				addButton.onclick = this.onAddButtonClicked;
			}
		}
		items.forEach(item => this.addItem(item));
	}

	addItem(item) {
		let t = this;
		if (!(item instanceof ListViewItem)) item = new ListViewItem(item);
		let i = item.render(this.container);
		i.onclick = e => {
			t.onItemClicked(item, e);
		};
		i.onBadgeClicked = (key, item, e) => {
			t.onItemBadgeClicked(key, item, e);
		};
		this.items.push(item);
	}

	expandItem(item) {

	}

	onAddButtonClicked() {
		console.log('Add Button Clicked');
	}

	onItemClicked(item) {
		console.log('Item Clicked', item);
	}

	onItemBadgeClicked(key, item, e) {
		console.log('Item Badge Clicked', item);
	}
}

class ListViewItem {
	constructor(obj = {}) {
		this.id = obj.id;
		this.title = obj.title;
		this.imageUrl = obj.imageUrl;
		this.description = obj.description;
		this.badges = obj.badges || [];
		this.data = obj.data;
		this.isFavorite = obj.isFavorite;
	}

	toRawData() {
		return {
			id: this.id,
			title: this.title,
			imageUrl: this.imageUrl,
			description: this.description,
			badges: this.badges,
			data: this.data
		};
	}

	render(container, card) {
		this.container = container;

		if (card) card.innerHTML = '';
		else card = ui.create('div', container, '', ['listViewItem']);

		this.card = card;

		let imgContainer = ui.create('div', card, null, ['listViewItemImgContainer']);
		if (this.imageUrl) {
			let img = ui.create('img', imgContainer, null, ['listViewItemImg']);

			if (this.imageUrl.indexOf('http') == 0) img.src = buildfire.imageLib.cropImage(this.imageUrl, { width: 128, height: 128 });
			// local
			else img.src = this.imageUrl;

			ui.create('i', imgContainer, null, ['listViewItemIcon']);
		}

		let listViewItemCopy = ui.create('div', card, null, ['listViewItemCopy', 'ellipsis', 'padded', 'padded--m']);

		ui.create('h5', listViewItemCopy, this.title, ['listViewItemTitle', 'ellipsis', 'margin--0']);

		if (this.description) ui.create('p', listViewItemCopy, this.description, ['listViewItemDescription', 'ellipsis', 'margin--0']);

		let t = this;
		if (this.badges && this.badges.length) {
			let listViewItemBadge = ui.create('div', card, null, ['listViewItemBadge']);
			this.badges.forEach(obj => {
				let i = ui.create('div', listViewItemBadge, null, ['listViewItemBadgeItem', 'badge']);
				let icon = ui.create('img', i, null, 'badgeIcon');
				icon.setAttribute('src', obj.imageUrl);
				i.onclick = e => {
					t.onBadgeClicked(obj.id, t, e);
					e.preventDefault();
					e.stopPropagation();
					return false;
				};
			});
		}

		const favoriteBtn = ui.create('div', card, null, ['listViewFavBtn']);
		ui.create('span', favoriteBtn, null, ['icon', `icon-star${this.isFavorite ? '' : '-empty'}`]);

		const optionsBtn = ui.create('div', card, null, ['listViewItemOptions']);
		ui.create('span', optionsBtn, null, ['icon', 'icon-ellipsis']);

		return card;
	}

	onBadgeClicked(key, item) {}


	update() {
		this.render(this.container, this.card);
	}
}
