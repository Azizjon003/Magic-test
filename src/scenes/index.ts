const { Scenes } = require("telegraf");
import control from "./control";
import start from "./start";
import testCreation from "./testCreation";
import balanceScene from "./balanceScene";

const stage = new Scenes.Stage([start, control, testCreation, balanceScene  ]);

export default stage;
