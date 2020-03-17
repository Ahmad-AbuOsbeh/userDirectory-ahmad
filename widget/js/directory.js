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

		if (!this.isService && typeof Favorites !== 'undefined') {
			this.Favorites = new Favorites(this.user);
			this.Favorites.get((error, favorites) => {
				if (error) return console.log(error);

				this.favoritesList = favorites;
			});
		}
	}

	addFavorite(userData, callback) {
		if (!this.user) return buildfire.auth.login({});
		if (typeof userData === 'string') {
			const userId = userData;
			userData = { userId };
		}

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

	getFavorites(callback) {
		if (!this.user) {
			callback(null, []);
		}
		if (this.favoritesList && this.favoritesList.length) {
			callback(null, this.favoritesList);
		}
		if (this.user && !this.isService && typeof Favorites !== 'undefined') {
			this.Favorites = new Favorites(this.user);
			this.Favorites.get((error, favorites) => {
				if (error) return callback(error, null);

				this.favoritesList = favorites;
				callback(null, this.favoritesList);
			});
		}
	}

	getBadges(callback) {
		if (this.badges && this.badges.length) {
			callback(null, this.badges);
		}
		Badges.get((error, badges) => {
			if (error) return callback(error, null);

			this.badges = badges;
			callback(null, this.badges);
		});
	}

	search(searchText, pageIndex, pageSize, callback) {
		let userIds = null;

		const _search = () => {
			this.getFavorites(() => {
				this.getBadges(() => {
					Users.search({ userIds, pageIndex, pageSize }, (error, results) => {
						if (error) return callback(error, null);

						results = results.map(result => {
							if (this.user) {
								result.data.isFavorite = this.favoritesList.indexOf(result.data.userId) > -1;
							}
							if (result.data.badges.length) {
								result.data.badges = this.badges.filter(badge => {
									return result.data.badges.indexOf(badge.id) > -1;
								});
							}
							result.data.action = {
								icon: result.data.isFavorite ? 'icon icon-star btn-primary' : 'icon icon-star-empty'
								// handler: item => {
								// if (item.isFavorite) {
								// 	return this.removeFavorite(item.data, (error, result) => {
								// 		if (!error) {
								// 			item.isFavorite = false;
								// 			item.action.icon = 'icon icon-star-empty';
								// 			item.update();
								// 		}
								// 	});
								// }
								// if (!item.isFavorite) {
								// 	return this.addFavorite(item.data, (error, result) => {
								// 		if (!error) {
								// 			item.isFavorite = true;
								// 			item.action.icon = 'icon icon-star';
								// 			item.update();
								// 		}
								// 	});
								// }
								// }
							};
							return result;
						});

						callback(null, results);
					});
				});
			});
		};

		if (searchText) {
			return Lookup.search({ searchText, pageIndex, pageSize }, (error, ids) => {
				userIds = ids;

				if (this.filterFavorites) {
					userIds = userIds.filter(id => this.favoritesList.indexOf(id) > -1);
				}

				_search();
			});
		}

		if (this.filterFavorites) {
			userIds = this.favoritesList;

			return _search();
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

	updateUser(userObj) {
		if (!this.user) return;

		buildfire.auth.getCurrentUser((error, user) => {
			if (error) return console.error(error);

			Badges.computeUserBadges(user, (err, badgeIds) => {
				if (err) return console.error(err);

				// this.getBadges((e, badges) => {
				let hasUpdate = false;

				if (this.user.badges.length < userObj.data.badges.length) {
					const newBadgeIds = badgeIds.filter(badgeId => {
						return userObj.data.badges.indexOf(badgeId) < 0;
					});

					this.user.badges = badgeIds;

					hasUpdate = true;
				} else {
					this.user.badges = badgeIds;
					hasUpdate = true;
				}

				const updateQueue = ['displayName', 'email', 'firstName', 'lastName'];

				updateQueue.forEach(key => {
					if (this.user[key] !== user[key]) {
						this.user[key] = user[key];
						hasUpdate = true;
					}
				});

				if (!hasUpdate) return;

				Users.update(this.user.toJson(), console.error);
				Lookup.update(this.user.toJson(), console.error);
				// });
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

	_insertDummyData() {
		const users = dummyData.getRandomNames(users => {
			users.forEach(user => {
				Users.add(new DirectoryUser(user).toJson(), console.error);
			});
		});
	}
}
