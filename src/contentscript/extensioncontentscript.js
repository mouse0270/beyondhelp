import $ from "jquery";
import AddMonsterButton from './addmonsters/AddMonsterButton';
import C from "../Constants";
import CampaignCharactersService from "./characters/CampaignCharactersService";
import ConfigStorageService from "../services/storage/ConfigStorageService";
import Configuration from "../data/Configuration";
import FavIconService from "./FavIconService";
import MessageService from "../services/MessageService";
import MonsterParseData from "./addmonsters/MonsterParseData";
import MonsterParseService from "./addmonsters/MonsterParseService";
import MyCharactersService from "./characters/MyCharactersService";
import PageScriptService from "../services/PageScriptService";
import React from 'react';
import ReactDOM from 'react-dom';
import TableRollService from "./tableroll/TableRollService";
import TinyMCEService from "./tinymce/TinyMCEService";

/* global chrome */

PageScriptService.run(`window.BeyondHelp = { id : "${chrome.runtime.id}"}`);

const createButton = function (id: string, name: string, hp: string) {
    const buttonSpan = document.createElement("span");
    ReactDOM.render(<AddMonsterButton monsterdata={{ id, name, hp }} />, buttonSpan);
    return buttonSpan;
};

const init = function (config: Configuration) {
    // render the add monster buttons
    MonsterParseService.parseMonsters(config).forEach(data => {
        const buttonsDiv = document.createElement("div");
        const monster = data.monsterData;
        buttonsDiv.appendChild(createButton(monster.id, monster.name, monster.hp, data.insert));
        buttonsDiv.appendChild(createButton(monster.id, monster.name, monster.diceHp, data.insert));
        data.insert(buttonsDiv);
    });

    // inits the table rollers
    if (config.tableroll) TableRollService.init();

    // workaround for homebrew spell tooltips that sever removes classes
    TinyMCEService.homebrewSpellTooltipWorkaround();
};

// listen a row loaded message to add monster buttons and parse tables
MessageService.listen(C.RowLoadedMessage, () => ConfigStorageService.getConfig().then(init));

// listen the message to close tinymce dialog
MessageService.listen(C.CloseTinyMessage, () => PageScriptService.run("tinymce.activeEditor.windowManager.close()"));

// listen the message to add content to tinymce
MessageService.listen(C.AddContentToTinyMessage, (message) => PageScriptService.run(`tinymce.activeEditor.insertContent(\`${message.content}\`)`));

ConfigStorageService.getConfig().then((config: Configuration) => {
    init(config);

    // change fav icon of char page
    if (config.charfavicon) FavIconService.changeFavIcon();

    // change my characters page
    if (config.mycharacterfolders) MyCharactersService.init();

    // change campaign page
    if (config.campaigncharacterfolders) CampaignCharactersService.init();

    TinyMCEService.init();
});