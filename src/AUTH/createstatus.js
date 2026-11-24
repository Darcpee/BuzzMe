const status = require("status");

exports.createStatus = async (req, res) => {

    const status = await Status.create({

        text: req.body.text,

        user: req.user.id

    });

    res.status(201).json(status);

};

// VIEW STATUS
exports.getStatuses = async (req, res) => {

    const statuses = await Status.find()
        .populate("user", "username profilePicture")
        .sort({ createdAt: -1 });

    res.json(statuses);

};

// DELETE STATUS
exports.deleteStatus = async (req, res) => {

    const status = await Status.findById(
        req.params.id
    );

    if (!status) {

        return res.status(404).json({
            message: "Status not found"
        });

    }

    if (
        status.user.toString() !== req.user.id
    ) {

        return res.status(403).json({
            message: "Unauthorized"
        });

    }

    await status.deleteOne();

    res.json({
        message: "Status deleted"
    });

};