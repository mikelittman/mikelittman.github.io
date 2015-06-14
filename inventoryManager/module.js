var makeRequest = function(params, callback){
    var request = window.location.hash.substr(1) + '?' + JSON.stringify(params);
    var script = document.createElement('script');
    script.src = request;
    callback && (script.onload = callback);
    document.body.appendChild(script);
};


var TextureCache = function(){};
TextureCache.prototype = new Array();
TextureCache.prototype.cache = function(texture){
    if(texture){
        var find;
        if(texture.id != null){
            find = this.assignByLocate('id', texture.id);
            if(find){
                if(texture.uuid)
                    find.uuid = texture.uuid;
                if(texture.name)
                    find.name = texture.name;
                return;
            }
        }
        else if(texture.name != null){
            find = this.assignByLocate('name', texture.name);
            if(find){
                if(texture.uuid)
                    find.uuid = texture.uuid;
                return;
            }
        }
        if(!find && texture.uuid){
            find = this.assignByLocate('uuid', texture.uuid);
            if(!find){
                texture.id = this.length;
                this.push(texture);
            }
            else {
                if(texture.name)
                    find.name = texture.name;
                if(texture.uuid)
                    find.uuid = texture.uuid;
            }
        }
        else{
            console.error("Textures must be something to be cached lol", texture);
        }
    }
};
TextureCache.prototype.assignByLocate = function (prop, query) {
    for(var i=0; i<this.length; i++){
        if(this[i][prop] != null && this[i][prop] == query){
            this[i].id = i;
            return this[i];
        }
    }
    return null;
};
TextureCache.prototype.export = function () {
    var list = [];
    for(var i=0; i<this.length; i++)
        list.push(this[i].export());
    return list;
};
TextureCache.prototype.import = function (obj, cb) {
    for(var i=0; i<obj.length; i++){
        var entry = obj[i];
        if(entry)
            TexturesSingleton.addNew(new Texture(entry.name, entry.uuid, entry.id));
    }
    cb && cb();
};
TextureCache.prototype.store = function () {
    var doc = this.export();
    localStorage.setItem('textureCache', JSON.stringify(doc));
};
TextureCache.prototype.recover = function (cb) {
    var cached = localStorage.getItem('textureCache');
    if(cached){
        cached = JSON.parse(cached);
        this.import(cached);
    }
    cb && cb();
};
var TextureCacheSingleton = new TextureCache();



var Textures = function(){};
Textures.prototype = new Array();
Textures.prototype.addNew = function(item){
    var texture = TextureCacheSingleton.assignByLocate('uuid', item.uuid);
    if(texture)
        item = texture;
    for(var i=0; i<this.length; i++)
        if(this[i].uuid === item.uuid)
            return;
    this.push(item);
};
Textures.prototype.filterMatches = function(str){
    var newList = [];
    str = str.toLowerCase();
    for(var i=0; i<this.length; i++)
        if(this[i].name.toLowerCase().indexOf(str) !== -1)
            newList.push(this[i]);
    return newList;
};
Textures.prototype.getByName = function (str){
    if(typeof str == 'object')
        str = str.name;
    for(var i=0;i<this.length; i++)
        if(this[i].name == str)
            return this[i];
    return null;
};
Textures.prototype.export = function () {
    var list = [];
    for(var i=0; i<this.length; i++)
        list.push(this[i].export());
    return list;
};

var TexturesSingleton = new Textures();

function Texture (name,uuid,id){
    this.name = name;
    this.uuid = uuid;
    this.id = id;

    TextureCacheSingleton.cache(this);
}
Texture.prototype.getName = function(){ return this.name; };
Texture.prototype.getUuid = function(){ return this.uuid; };
Texture.prototype.getId = function(){ return this.id; };
Texture.prototype.setId = function(id){ this.id = id; };
Texture.prototype.export = function(){
    return {
        name: this.name,
        uuid: this.uuid,
        id: this.id
    };
};
Texture.prototype.clone = function () {
    return new Texture(
        this.name,
        this.uuid
    );
};
Texture.parse = function (id) {
    return TextureCacheSingleton.assignByLocate('id', id);
};

function Material (diffuse, normal, specular){
    this.diffuse = diffuse;
    this.normal = normal;
    this.specular = specular;
}
Material.prototype.export = function(){
    return {
        d: this.diffuse ? this.diffuse.id : null,
        n: this.normal ? this.normal.id : null,
        s: this.specular ? this.specular.id : null
    };
};
Material.prototype.clone = function () {
    return new Material(
        this.diffuse.clone(),
        this.normal.clone(),
        this.specular.clone()
    );
};
Material.parse = function (d) {
    return new Material(
        Texture.parse(d.d), Texture.parse(d.n), Texture.parse(d.s)
    );
};

function Icon (texture,index) {
    this.texture = texture;
    this.index = index;
}
Icon.prototype.export = function () {
    return {
        t: this.texture.id,
        i: this.index
    };
};
Icon.prototype.clone = function () {
    return new Icon(this.texture.clone(), this.index);
};
Icon.parse = function (d) {
    return new Icon(Texture.parse(d.t), d.i);
};

function Theme (name, icon, jetpack_material, wing_material){
    this.name = name;
    this.icon = icon;
    this.jetpack = jetpack_material;
    this.wing = wing_material;
}
Theme.prototype.getName = function () {
    return this.name;
};
Theme.prototype.export = function(){
    var exported = {};
    exported[this.name] = {
        j: this.jetpack.export(),
        w: this.wing.export(),
        i: this.icon ? this.icon.export() : null
    };
    return exported;
};
Theme.parse = function (n, d) {
    return new Theme(n, Icon.parse(d.i), Material.parse(d.j), Material.parse(d.w));
};

var ThemeList = function(){};
ThemeList.prototype = new Array();
ThemeList.prototype.addNew = function(theme){
    for(var i=0; i<this.length; i++){
        if(this[i].name == theme.name){
            //theme exists, overwrite
            delete this[i];
            this[i] = theme;
            return false;
        }
    }
    this.push(theme);
    return true;
};
ThemeList.prototype.getByName = function (name){
    for(var i=0; i<this.length; i++)
        if(this[i].name === name)
            return this[i];
    return null;
};
ThemeList.prototype.export = function () {
    var exported = {};
    for(var i=0; i<this.length; i++)
        angular.merge(exported, this[i].export());
    return exported;
};
ThemeList.prototype.import = function (obj, cb) {
    console.log(obj);
    for(var name in obj){
        var entry = obj[name];
        if(entry)
            this.push(Theme.parse(name,entry));
    }
    cb && cb();
};
ThemeList.prototype.store = function () {
    var doc = this.export();
    localStorage.setItem('themeList', JSON.stringify(doc));
};
ThemeList.prototype.recover = function (cb) {
    var cached = localStorage.getItem('themeList');
    if(cached){
        cached = JSON.parse(cached);
        this.import(cached);
    }
    cb && cb()
};
var ThemeListSingleton = new ThemeList();

//JSON callback
window.doThing = function(doc){
    var request = doc.request;
    if(request){
        if(request == "gotInventory"){
            var items = doc.items;

            for(var item in items){
                var uuid = items[item],
                    texture = new Texture(item,uuid);
                TexturesSingleton.addNew(texture);
            }
        }
    }
};


//angular module begin
angular.module('inventoryManager', ['ui.bootstrap'])
    .controller('Manager', function($scope, $q, $window){
        $scope.textures = TexturesSingleton;
        $scope.texture_cache = TextureCacheSingleton;
        $scope.themes = ThemeListSingleton;

        $scope.canvas = document.getElementById('tiles');

        $scope.fields = {
            textures: {
                jetpack: {
                    diffuse: '',
                    normal: '',
                    specular: ''
                },
                wing: {
                    diffuse: '',
                    normal: '',
                    specular: ''
                },
                icon: {
                    name: '',
                    path: '//placehold.it/256x256',
                    save: ''
                }
            },
            filters: {
                inv_search: ''
            },
            theme: {
                name: '',
                selected: ''
            },
            xfer: {
                json: ''
            }
        };

        var defaults = {
            fields: {
                textures: {
                    jetpack: {
                        diffuse: '',
                        normal: '',
                        specular: ''
                    },
                    wing: {
                        diffuse: '',
                        normal: '',
                        specular: ''
                    },
                    icon: {
                        name: '',
                        path: '//placehold.it/256x256',
                        save: ''
                    }
                },
                filters: {
                    inv_search: ''
                },
                theme: {
                    name: '',
                    selected: ''
                },
                xfer: {
                    json: ''
                }
            }
        };

        $scope.$watch('themes', function(){

        });


        var canvasRedraw = function(){
            var canvas = $scope.canvas,
                texture = $scope.fields.textures.icon.name;

            if(typeof texture == "string")
                texture = TexturesSingleton.getByName(texture);

            if(canvas.getContext){
                var ctx = canvas.getContext('2d');
                var img = document.getElementById('tiles_ref');
                var icon = $scope.fields.textures.icon.save;


                var newPath = '//placehold.it/256x256';

                if(texture && texture.uuid)
                    newPath = 'https://secondlife.com/app/image/' + texture.uuid + '/1';


                img.onload = function(){
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = canvas.width;
                    ctx.drawImage(img, 0, 0, 256, 256);

                    if(icon && icon.index != null){
                        var x = icon.index % 6,
                            y = Math.floor(icon.index / 6),
                            math = 256/6;
                        ctx.rect(x*math,y*math,math,math);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'red';
                        ctx.stroke();

                        $scope.fields.textures.icon.save = Icon.parse({t:texture.id,i:icon.index});
                    }

                    img.onload = null;
                };

                if(img.complete && newPath == $scope.fields.textures.icon.path){
                    img.onload();
                }
                else{
                    $scope.fields.textures.icon.path = newPath;
                }
            }
        };


        $scope.canvas.onclick = function(e){
            var x;
            var y;
            if (e.pageX || e.pageY) {
              x = e.pageX;
              y = e.pageY;
            }
            else {
              x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
              y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            x -= $scope.canvas.offsetLeft;
            y -= $scope.canvas.offsetTop;

            var math = 256/6;

            x /= math;
            y /= math;

            x = Math.floor(x);
            y = Math.floor(y);

            if(x > 5)
                x = 5;
            if(y > 5)
                y = 5;

            //Save fields
            var icon = new Icon($scope.fields.textures.icon.name, x+y*6);
            $scope.fields.textures.icon.save = icon;

            //Redraw canvas with saved icon
            canvasRedraw();
        };

        $scope.exportData = function(){
            $scope.fields.xfer.json = JSON.stringify({
                c: $scope.texture_cache.export(),
                t: $scope.themes.export()
            });
        };

        $scope.importData = function () {
            try{
                var parse = JSON.parse($scope.fields.xfer.json);
                $scope.texture_cache.import(parse.c, function () {
                    $scope.themes.import(parse.t);
                });
            }
            catch(e){
                console.log(e);
            }
        };

        $scope.clearFilter = function () {
            $scope.fields.filters.inv_search = '';
        }

        $scope.themeChanged = function(t){
            //Load this theme
            if(!$scope.fields.theme.selected)
                return;

            var theme = angular.copy($scope.fields.theme.selected);
            $scope.fields.textures = defaults.fields.textures;
            if(theme){
                $scope.fields.theme.name = $scope.fields.theme.selected.name;
                $scope.fields.textures = defaults.fields.textures;
                $scope.fields.textures = angular.merge(defaults.fields.textures, {
                    jetpack: {
                        diffuse: theme.jetpack.diffuse ? theme.jetpack.diffuse.name : '',
                        normal: theme.jetpack.normal ? theme.jetpack.normal.name : '',
                        specular: theme.jetpack.specular ? theme.jetpack.specular.name : ''
                    },
                    wing: {
                        diffuse: theme.wing.diffuse ? theme.wing.diffuse.name : '',
                        normal: theme.wing.normal ? theme.wing.normal.name : '',
                        specular: theme.wing.specular ? theme.wing.specular.name : ''
                    },
                    icon: {
                        name: theme.icon.texture.name,
                        save: theme.icon
                    }
                });
                canvasRedraw();
            }
        };


        $scope.saveTheme = function () {
            var fields = angular.copy($scope.fields),
                name = angular.copy(fields.theme.name.trim()),
                jetpack = angular.copy(fields.textures.jetpack),
                wing = angular.copy(fields.textures.wing),
                icon = fields.textures.icon.save,
                jetpack_mat = new Material(
                    angular.copy($scope.textures.getByName(jetpack.diffuse)),
                    angular.copy($scope.textures.getByName(jetpack.normal)),
                    angular.copy($scope.textures.getByName(jetpack.specular))),
                wing_mat = new Material(
                    angular.copy($scope.textures.getByName(wing.diffuse)),
                    angular.copy($scope.textures.getByName(wing.normal)),
                    angular.copy($scope.textures.getByName(wing.specular)))
                ;

            var theme = new Theme(name,icon,jetpack_mat,wing_mat);

            $scope.themes.addNew(theme);
            $scope.fields.theme.selected = theme;
            //$scope.fields.textures = defaults.fields.textures;

            $scope.texture_cache.store();
            $scope.themes.store();
        };

        $scope.iconChanged = function (item) {
            var texture = item;
            if(texture == undefined || texture.uuid == undefined)
                return;

            $scope.fields.textures.icon.name = item;

            canvasRedraw();
        };

        $scope.getTextures = function(){
            return $scope.textures.export();
        };

        $scope.refreshInventory = function refreshInventory(){
            makeRequest({'request': 'getInventory'}, (function(scope){
                scope.$apply();
            }).bind(this, $scope));
        };

        $scope.emptyCache = function () {
            localStorage.clear();
            $scope.themes.length = 0;
            $scope.textures.length = 0;
            $scope.texture_cache.length = 0;
        };

        $scope.texture_cache.recover(function(){
            $scope.themes.recover(function(){
                $scope.refreshInventory();
            });
        });
    })
    .directive('typeaheadWatchChanges', function () {
        return {
            require: ['ngModel'],
            link: function(scope, element, attr, ctrls){
                scope.$watch('item', function (value) {
                    ctrls[0].$setViewValue(value);
                });
            }
        };
    });
