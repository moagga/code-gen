const su = require("underscore.string");
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

var module = process.argv[2];
const ROOT = path.join(path.dirname(process.argv[1]), 'output', module);
console.log(ROOT);

// var data = { "module": module };

/* Read code-gen config */
var configPath = path.join(ROOT, 'code-gen-config.json');
var data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
data.module = module;

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

//Sub directory for search components
(function(){
    var p = path.join(ROOT, 'components', 'search', 'form');
    if (!fileExists(p)){
        fs.mkdirSync(p);
    }
})();

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
    
    // let fields = [
    //     {name: 'id', type: 'number'},
    //     {name: 'settlementTypeCd', type: 'TypeCodeDesc'}
    // ];

    let context = {
        module: module,
        fields: data.search.model.fields
    };

    fs.writeFileSync(uri, execTemplate('templates/search-model.txt', context));
})();

/**
 * Search components code generation
 */
//Search Root component
(function generateSearchRootComponent(){
    let uri = path.join(ROOT, 'components', 'search', 'search.component.ts');
    if (fileExists(uri)){
        return
    }
    
    let context = {
        module: module
    };

    fs.writeFileSync(uri, execTemplate('templates/search-root-component.txt', context));
})();

//Search Root template
(function generateSearchRootTemplate(){
    let uri = path.join(ROOT, 'components', 'search', 'search.component.html');
    if (fileExists(uri)){
        return
    }
    
    let context = {
        module: module,
        columns: data.search.grid.columns
    };

    fs.writeFileSync(uri, execTemplate('templates/search-root-template.txt', context));
})();

//Search basic filter component
(function generateSearchBasicFilterComponent(){
    let uri = path.join(ROOT, 'components', 'search', 'form', 'basic-seach-form.component.ts');
    if (fileExists(uri)){
        return
    }
    
    let context = {
        module: module,
        fields: data.search.basicFilters.fields
    };

    fs.writeFileSync(uri, execTemplate('templates/search-basic-form-component.txt', context));
})();

//Search basic filter template
(function generateSearchBasicFilterTemplate(){
    let uri = path.join(ROOT, 'components', 'search', 'form', 'basic-seach-form.component.html');
    if (fileExists(uri)){
        return
    }
    
    let context = {
        module: module,
        fields: data.search.basicFilters.fields
    };

    fs.writeFileSync(uri, execTemplate('templates/search-basic-form-template.txt', context));
})();
