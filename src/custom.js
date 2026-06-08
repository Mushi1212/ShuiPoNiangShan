/* extension/水泊娘山/src/custom.js */
const EXTENSION_NAME = "水泊娘山";
const EXTENSION_PATH = "./extension/水泊娘山/"; 
const CSS_FILES = [
    "src/styles/player.css"
];
function loadAllCSSFiles() {
    CSS_FILES.forEach(function(cssPath) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = EXTENSION_PATH + cssPath;
        document.head.appendChild(link);
    });
}
function reification(player, options = {}) {
    const { coverMain = true, coverDeputy = false } = options;
    loadAllCSSFiles();
    if (coverMain) player.classList.add('reification');
    if (coverDeputy && player.name2) player.classList.add('reification2');
}
function unReification(player, options = {}) {
    const { uncoverMain = true, uncoverDeputy = true } = options;
    if (uncoverMain) player.classList.remove('reification');
    if (uncoverDeputy) player.classList.remove('reification2');
}

function initCustomStyles() {
    loadAllCSSFiles();
}

export {
    reification,
    unReification,
    initCustomStyles
};