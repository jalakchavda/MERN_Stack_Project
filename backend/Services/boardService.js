const { findOne } = require('../Models/boardModel');
const boardModel = require('../Models/boardModel');
const userModel = require('../Models/userModel');

const create = async (req, callback) => {
	try {
		const { title, backgroundImageLink, members } = req.body;
		let newBoard = boardModel({ title, backgroundImageLink });
		newBoard.save();

		const user = await userModel.findById(req.user.id);
		user.boards.unshift(newBoard.id);
		await user.save();

		let allMembers = [];
		allMembers.push({
			user: user.id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			color: user.color,
			role: 'owner',
		});

		await Promise.all(
			members.map(async (member) => {
				const newMember = await userModel.findOne({ email: member.email });
				newMember.boards.push(newBoard._id);
				await newMember.save();
				allMembers.push({
					user: newMember._id,
					name: newMember.name,
					surname: newMember.surname,
					email: newMember.email,
					color: newMember.color,
					role: 'member',
				});
				
				newBoard.activity.push({
					user: user.id,
					name: user.name,
					action: `added user '${newMember.name}' to this board`,
				});
			})
		);

		newBoard.activity.unshift({ user: user._id, name: user.name, action: 'created this board', color: user.color });

		newBoard.members = allMembers;
		await newBoard.save();

		return callback(false, newBoard);
	} catch (error) {
		return callback({
			errMessage: 'Something went wrong',
			details: error.message,
		});
	}
};

const getAll = async (userId, callback) => {
	try {
		const user = await userModel.findById(userId);

		const boardIds = user.boards;

		const boards = await boardModel.find({ _id: { $in: boardIds } });

		boards.forEach((board) => {
			board.activity = undefined;
			board.lists = undefined;
		});

		return callback(false, boards);
	} catch (error) {
		return callback({ msg: 'Something went wrong', details: error.message });
	}
};

const getById = async (id, callback) => {
	try {
		const board = await boardModel.findById(id);
		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const getActivityById = async (id, callback) => {
	try {
		const board = await boardModel.findById(id);
		return callback(false, board.activity);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const updateBoardTitle = async (boardId, title, user, callback) => {
	try {
		const board = await boardModel.findById(boardId);
		board.title = title;
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update title of this board',
			color: user.color,
		});
		await board.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const updateBoardDescription = async (boardId, description, user, callback) => {
	try {
		const board = await boardModel.findById(boardId);
		board.description = description;
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update description of this board',
			color: user.color,
		});
		await board.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const updateBackground = async (id, background, isImage, user, callback) => {
	try {
		const board = await boardModel.findById(id);

		board.backgroundImageLink = background;
		board.isImage = isImage;

		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update background of this board',
			color: user.color,
		});

		await board.save();

		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const addMember = async (id, members, user, callback) => {
	try {
		const board = await boardModel.findById(id);

		await Promise.all(
			members.map(async (member) => {
				const newMember = await userModel.findOne({ email: member.email });
				newMember.boards.push(board._id);
				await newMember.save();
				board.members.push({
					user: newMember._id,
					name: newMember.name,
					surname: newMember.surname,
					email: newMember.email,
					color: newMember.color,
					role: 'member',
				});
				
				board.activity.push({
					user: user.id,
					name: user.name,
					action: `added user '${newMember.name}' to this board`,
					color: user.color,
				});
			})
		);
		
		await board.save();

		return callback(false, board.members);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

module.exports = {
	create,
	getAll,
	getById,
	getActivityById,
	updateBoardTitle,
	updateBoardDescription,
	updateBackground,
	addMember,
};
