const { Scenes } = require("telegraf");
import control from "./control";
import start from "./start";
import testCreation from "./testCreation";

const stage = new Scenes.Stage([start, control, testCreation]);

export default stage;
