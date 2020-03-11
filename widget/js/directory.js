/**
 * @class Directory
 * Manages directory data
 */

class Directory {
	constructor(user) {
		this.user = user ? new DirectoryUser(user) : null;

		this.badges = null;
		this.Favorites = null;

		this.favoritesList = null;
		this.filterFavorites = false;

		if (!this.user) return;

		if (this.isService && typeof Badges !== 'undefined') {
			// buildfire.auth.getCurrentUser((e, user) => {
			// 	this.badges.computeUserBadges(user, console.error);
			// });
		}

		if (!this.isService && typeof Favorites !== 'undefined') {
			this.Favorites = new Favorites(this.user);
			this.Favorites.get((error, favorites) => {
				if (error) return console.log(error);

				this.favoritesList = favorites;
			});
		}
	}

	get favorites() {
		return this.favoritesList;
	}

	addFavorite(userData, callback) {
		if (!this.user) return buildfire.auth.login({});

		this.Favorites.add(userData, (error, result) => {
			if (error) return callback(error);

			if (result.nModified && result.status === 'updated') {
				this.favoritesList.push(userData.userId);
			}

			callback(null, this.favoritesList);
		});
	}

	removeFavorite(userData, callback) {
		if (!this.user) return buildfire.auth.login({});

		this.Favorites.delete(userData, (error, result) => {
			if (error) return callback(error);

			if (result.nModified && result.status === 'updated') {
				this.favoritesList = this.favoritesList.filter(userId => userId !== userData.userId);
			}

			callback(null, this.favoritesList);
		});
	}

	search(searchText, pageIndex, pageSize, callback) {
		let userIds = null;

		const _search = () => {
			Users.search({ userIds, pageIndex, pageSize }, callback);
		};

		if (searchText) {
			return Lookup.search({ searchText, pageIndex, pageSize }, (error, ids) => {
				userIds = ids;

				_search();
			});
		}

		_search();
	}

	addUser(callback) {
		if (!this.user) return;

		Users.add(this.user.toJson(), callback);
	}

	checkUser(callback) {
		if (!this.user) return;

		Users.getByUserId(this.user.userId, (error, result) => {
			if (error) return callback(error, false);

			callback(null, result);
		});
	}

	updateUser() {
		if (!this.user) return;

		buildfire.auth.getCurrentUser((error, user) => {
			if (error) return console.error(error);

			Badges.computeUserBadges(user, (err, badges) => {
				if (err) return console.error(err);
				// let hasUpdate = false;

				// if (this.user.badges.length !== badges.length) {
					// hasUpdate = true;
					this.user.badges = badges;
				// }

				const updateQueue = ['displayName', 'email', 'firstName', 'lastName'];

				updateQueue.forEach(key => {
					if (this.user[key] !== user[key]) {
						this.user[key] = user[key];
						// hasUpdate = true;
					}
				});

				// if (!hasUpdate) return;

				Users.update(this.user.toJson(), console.error);
				Lookup.update(this.user.toJson(), console.error);
			});
		});
	}

	removeUser(callback) {
		if (!this.user) return;

		Users.delete(this.user.userId, callback);
	}

	_clear() {
		Lookup._clear();
		Users._clear();
	}
}
