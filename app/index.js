const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");
const {organizationModel, userModel, boardModel, issueModel} = require("./models");
const cors = require("cors");




const app = express();
app.use(express.json());
app.use(cors());

// CREATE
app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists=  await userModel.findOne({
        username:username,
        
    })    
    if (userExists) {
        res.status(411).json({
            message: "User with this username already exists"
        })
        return;
    }

    const newuser = await userModel.create({
        username:username,
        password:password
    });

    res.json({
        message: "You have signed up successfully"
    })

})

app.post("/signin", async (req, res) => {
  const username=req.body.username;
     const password=req.body.password;
     
     const userExists= await userModel.findOne({
         username : username,
         password:password
     });
     if(!userExists){
     res.status(403).json({
         message: "username or password is incorrect"
     })
     return;
     }
     // create a jwt for the users
     const token=jwt.sign({
         userId:userExists.id
     },"secret12");
     
     res.json({
         token
     })
})

// AUTHENTICATED ROUTE - MIDDLEWARE
app.post("/organization", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const newOrg = await organizationModel.create({
        title: req.body.title,
        description: req.body.description,
        admin: userId,
        members: []
    });

    res.json({
        message: "Org created",
        id: newOrg._id
    })
})

app.post("/add-member-to-organization", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUserUsername = req.body.memberUserUsername;

    const organization = await organizationModel.findById(organizationId);

    if (!organization || organization.admin.toString() !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const memberUser = await userModel.findOne({ username: memberUserUsername });

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exists in our db"
        })
        return
    }

    organization.members.push(memberUser._id);
    await organization.save();

    res.json({
        message: "New member added!"
    })
})

app.post("/board", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { title, organizationId } = req.body;

    const organization = await organizationModel.findById(organizationId);

    if (!organization || organization.admin.toString() !== userId) {
        res.status(403).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const newBoard = await boardModel.create({
        title,
        organizationId
    });

    res.json({
        message: "Board created",
        id: newBoard._id
    })
})

app.post("/issue", authMiddleware, async (req, res) => {
    const { title, description, boardId } = req.body;

    const board = await boardModel.findById(boardId);
    if(!board) {
        return res.status(404).json({ message: "Board not found" });
    }

    const newIssue = await issueModel.create({
        title,
        description,
        boardId
    });

    res.json({
        message: "Issue created",
        id: newIssue._id
    })
})

//GET endpoints
app.get("/organization", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizationId = req.query.organizationId;

    const organization = await organizationModel.findById(organizationId).populate("members", "username");

    console.log(organization);
    console.log(userId);
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }

    const isAdmin = organization.admin.toString() === userId;
    const isMember = organization.members.some(member => member._id.toString() === userId);

    if (!isAdmin && !isMember) {
        res.status(403).json({
            message: "Either this org doesnt exist or you are not a part of this org"
        })
        return
    }

    res.json({
        organization: {
            _id: organization._id,
            title: organization.title,
            description: organization.description,
            admin: organization.admin,
            members: organization.members.map(user => ({
                id: user._id,
                username: user.username
            }))
        }
    })
})

app.get("/organizations", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizations = await organizationModel.find({
        $or: [{ admin: userId }, { members: userId }]
    });
    res.json({ organizations });
})

app.get("/boards", authMiddleware, async (req, res) => {
    const organizationId = req.query.organizationId;
    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }
    
    // Check if user is admin or a member
    const userId = req.userId;
    const isAdmin = organization.admin.toString() === userId;
    const isMember = organization.members.some(memberId => memberId.toString() === userId);
    
    if(!isAdmin && !isMember) {
        return res.status(403).json({ message: "You are not part of this organization" });
    }

    const boards = await boardModel.find({ organizationId });
    res.json({ boards });
})

app.get("/issues", authMiddleware, async (req, res) => {
    const boardId = req.query.boardId;
    const issues = await issueModel.find({ boardId });
    res.json({ issues });
})

app.get("/members", authMiddleware, async (req, res) => {
    const organizationId = req.query.organizationId;
    const organization = await organizationModel.findById(organizationId).populate("members", "username");
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }
    
    res.json({
        members: organization.members.map(user => ({
            id: user._id,
            username: user.username
        }))
    });
})


// UPDATE
app.put("/issues", authMiddleware, async (req, res) => {
    const { issueId, status } = req.body;
    
    const issue = await issueModel.findById(issueId);
    if(!issue) {
        return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = status;
    await issue.save();

    res.json({ message: "Issue updated successfully!" });
})

//DELETE -- FIND THE GBUG and fix it
app.delete("/members", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memerUserUsername = req.body.memberUserUsername;

    const organization = await organizationModel.findById(organizationId);

    if (!organization || organization.admin.toString() !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const memberUser = await userModel.findOne({ username: memerUserUsername });

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exists in our db"
        })
        return
    }

    organization.members = organization.members.filter(id => id.toString() !== memberUser._id.toString());
    await organization.save();

    res.json({
        message: "member deleted!"
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});