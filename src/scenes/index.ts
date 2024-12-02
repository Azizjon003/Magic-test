const { Scenes } = require("telegraf");
import control from "./control";
import start from "./start";
import testCreation from "./testCreation";
import balanceScene from "./balanceScene";
import adminScene from "./adminScene";

const stage = new Scenes.Stage([start, control, testCreation, balanceScene, adminScene]);

export default stage;
