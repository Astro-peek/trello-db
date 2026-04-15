const mongoose = require("mongoose");
mongoose.connect("mongodb://parasgupta548_db_user:5iE7DENtEubU7JVa@ac-8d4b0v2-shard-00-00.jubfrcq.mongodb.net:27017,ac-8d4b0v2-shard-00-01.jubfrcq.mongodb.net:27017,ac-8d4b0v2-shard-00-02.jubfrcq.mongodb.net:27017/trello-app-AI?ssl=true&replicaSet=atlas-mnrxq2-shard-0&authSource=admin&appName=Cluster0");

const userSchema = mongoose.Schema({
    username: String,
    password: String
})


const organizationSchema = mongoose.Schema({
    title: String,
    description: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
})

const organizationModel = mongoose.model("organization", organizationSchema);
const userModel = mongoose.model("users", userSchema);

const boardSchema = mongoose.Schema({
    title: String,
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' }
})
const boardModel = mongoose.model("board", boardSchema);

const issueSchema = mongoose.Schema({
    title: String,
    description: String,
    status: { type: String, default: 'to-do' }, // e.g., to-do, in-progress, done
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'board' }
})
const issueModel = mongoose.model("issue", issueSchema);

module.exports = {
    organizationModel,
    userModel,
    boardModel,
    issueModel
}