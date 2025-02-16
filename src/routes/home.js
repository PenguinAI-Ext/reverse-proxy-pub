module.exports = (app) => {
	app.get(['/', '/v1'], (req, res) => {
    	return res.status(200).json({ message: "Welcome to the PenguinAI API. | Join our Discord! https://discord.gg/r6DuJT6G2m" })
    })
}