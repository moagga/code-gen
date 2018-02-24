const su = require("underscore.string");
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

var module = process.argv[2];
const ROOT = path.join(path.dirname(process.argv[1]), 'output', module);
console.log(ROOT);

var data = { "module": module };

var camelize = function(input){
    return su(input).camelize().value();
}

var titleize = function(input){
    let tmp = su.titleize(su.replaceAll(input, '-', ' '));
    return su.replaceAll(tmp, ' ', '');
}

function fileExists(path){
    return fs.existsSync(path);
}

handlebars.registerHelper('titlize', titleize);
handlebars.registerHelper('camelize', camelize);

if (!fs.existsSync(ROOT)){
    fs.mkdirSync(ROOT);
}

function execTemplate(name, data){
    var source = fs.readFileSync(name, 'utf8');
    var template = handlebars.compile(source);
    var result = template(data);
    return result;
}

(function generateModule(){
    let uri = path.join(ROOT, module + '.module.ts');
    if (fileExists(uri)){
        return
    }

    fs.writeFileSync(uri, execTemplate('templates/module.htm', data));
})();

(function generateRootComponent(){
    let uri = path.join(ROOT, module + '.component.ts');
    if (fileExists(uri)){
        return
    }
    
    fs.writeFileSync(uri, execTemplate('templates/root-component.htm', data));
})();
