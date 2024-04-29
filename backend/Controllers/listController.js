const listService = require('../Services/listService');

const create = async (req, res) => {
	const { title, boardId } = req.body;
	if (!(title && boardId)) return res.status(400).send({ errMessage: 'Title cannot be empty' });

	const validate = req.user.boards.filter((board) => board === boardId);
	if (!validate)
		return res
			.status(400)
			.send({ errMessage: 'You can not add a list to the board, you are not a member or owner!' });

	await listService.create({ title: title, owner: boardId }, req.user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(201).send(result);
	});
};

const getAll = async (req, res) => {
	const boardId = req.params.id;

	
	const validate = req.user.boards.filter((board) => board === boardId);
	if (!validate)
		return res.status(400).send({ errMessage: 'You cannot get lists, because you are not owner of this lists!' });

	await listService.getAll(boardId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};

const deleteById = async (req, res) => {
	const { listId, boardId } = req.params;
	const user = req.user;

	if (!(listId && boardId)) return res.status(400).send({ errMessage: 'List or board undefined' });

	await listService.deleteById(listId, boardId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};

const updateCardOrder = async (req, res) => {
	const { boardId, sourceId, destinationId, destinationIndex, cardId } = req.body;
	const user = req.user;

	if (!(boardId && sourceId && destinationId && cardId))
		return res.status(400).send({ errMessage: 'All parameters not provided' });

	const validate = user.boards.filter((board) => board === boardId);
	if (!validate) return res.status(403).send({ errMessage: 'You cannot edit the board that you hasnt' });

	await listService.updateCardOrder(boardId, sourceId, destinationId, destinationIndex, cardId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};

const updateListOrder = async (req, res) => {
	const { boardId, sourceIndex, destinationIndex, listId } = req.body;
	const user = req.user;

	if (!(boardId && sourceIndex != undefined && destinationIndex != undefined && listId))
		return res.status(400).send({ errMessage: 'All parameters not provided' });

	const validate = user.boards.filter((board) => board === boardId);
	if (!validate) return res.status(403).send({ errMessage: 'You cannot edit the board that you hasnt' });

	await listService.updateListOrder(boardId, sourceIndex, destinationIndex, listId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};

const updateListTitle = async (req, res) => {
	const { listId, boardId } = req.params;
	const user = req.user;
	const {title} = req.body;

	if (!(listId && boardId)) return res.status(400).send({ errMessage: 'List or board undefined' });

	await listService.updateListTitle(listId, boardId, user,title, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};

module.exports = {
	create,
	getAll,
	deleteById,
	updateCardOrder,
	updateListOrder,
	updateListTitle,
};
