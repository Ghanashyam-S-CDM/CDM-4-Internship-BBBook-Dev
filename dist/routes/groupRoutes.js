"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModelGroup_1 = require("../models/ModelGroup");
const authController_1 = require("../controllers/authController");
const utils_1 = require("../utils");
const groupRouter = express_1.Router();
groupRouter.get('/api/groups-full', authController_1.authenticate, async function (req, res, next) {
    try {
        utils_1.sendJson(req, res, await ModelGroup_1.groupsToFull(await ModelGroup_1.getGroupsFromUsers([req.user.id])));
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
groupRouter.get('/api/group-full/:group_id', 
// authenticate,
async function (req, res, next) {
    try {
        utils_1.sendJson(req, res, await ModelGroup_1.groupsToFull(await ModelGroup_1.getGroups([req.params.group_id])));
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
groupRouter.post('/api/group', authController_1.authenticate, async function (req, res, next) {
    try {
        const { group_id } = (await ModelGroup_1.addGroup(req.body))[0];
        utils_1.sendJson(req, res, {
            group_id,
            ...(await ModelGroup_1.groupsToFull(await ModelGroup_1.getGroups([group_id])))
        });
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
groupRouter.put('/api/group', authController_1.authenticate, async function (req, res, next) {
    try {
        utils_1.sendJson(req, res, await ModelGroup_1.groupsToFull(await ModelGroup_1.getGroups([(await ModelGroup_1.editGroup(req.body))])));
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
groupRouter.put('/api/join-group', authController_1.authenticate, async function (req, res, next) {
    try {
        await ModelGroup_1.addGroupMember(req.body);
        utils_1.sendJson(req, res, await ModelGroup_1.groupsToFull(await ModelGroup_1.getGroups([req.body.group_id])));
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
groupRouter.put('/api/archive-group', authController_1.authenticate, async function (req, res, next) {
    try {
        // console.log(req.body)
        utils_1.sendJson(req, res, await ModelGroup_1.groupsToFull(await ModelGroup_1.archiveGroup(req.body)));
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
exports.default = groupRouter;
//# sourceMappingURL=groupRoutes.js.map