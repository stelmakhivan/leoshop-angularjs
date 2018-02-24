var fs = require("fs");
function ItemsInfo(){
    
}
ItemsInfo.prototype.readInfo = function () {
    return fs.readFileSync('./text/about-item.txt');
    // read something from file
};
ItemsInfo.prototype.writeInfo = function (data) {
    return fs.writeFile('./text/about-item.txt', data, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });//write into file
};

global.ItemsInfo = ItemsInfo;