const su = require("underscore.string");
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

var module = process.argv[2];
const ROOT = path.join(path.dirname(process.argv[1]), 'output', module);
console.log(ROOT);

var data = { "module": module };

/* Helpers */
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

function execTemplate(name, data){
    var source = fs.readFileSync(name, 'utf8');
    var template = handlebars.compile(source);
    var result = template(data);
    return result;
}

handlebars.registerHelper('titlize', titleize);
handlebars.registerHelper('camelize', camelize);

/* Code Generation */

//Root directory for module
if (!fileExists(ROOT)){
    fs.mkdirSync(ROOT);
}

//Directory for components, models & services
['components', 'model', 'service'].forEach(folder => {
    var p = path.join(ROOT, folder);
    if (!fileExists(p)){
        fs.mkdirSync(p);
    }
});

//Sub directory for components
['search', 'edit', 'view'].forEach(folder => {
    var p = path.join(ROOT, 'components', folder);
    if (!fileExists(p)){
        fs.mkdirSync(p);
    }
});

//Root module
(function generateModule(){
    let uri = path.join(ROOT, module + '.module.ts');
    if (fileExists(uri)){
        return
    }

    fs.writeFileSync(uri, execTemplate('templates/module.txt', data));
})();

//Root component
(function generateRootComponent(){
    let uri = path.join(ROOT, module + '.component.ts');
    if (fileExists(uri)){
        return
    }
    
    fs.writeFileSync(uri, execTemplate('templates/root-component.txt', data));
})();

//Search service
(function generateSearchServiceComponent(){
    let uri = path.join(ROOT, 'service', module + '-search.service.ts');
    if (fileExists(uri)){
        return
    }
    
    fs.writeFileSync(uri, execTemplate('templates/search-service.txt', data));
})();

//Search model
(function generateSearchModelComponent(){
    let uri = path.join(ROOT, 'model', module + '-search.model.ts');
    if (fileExists(uri)){
        return
    }
    
    let fields = [
        {name: 'id', type: 'number'},
        {name: 'settlementTypeCd', type: 'TypeCodeDesc'}
    ];

    let context = {
        module: module,
        fields: fields
    };

    fs.writeFileSync(uri, execTemplate('templates/search-model.txt', context));
})();
