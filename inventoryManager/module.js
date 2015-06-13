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
    if(texture && texture.getName() !== null){
        var find = this.indexOf(texture.getUuid());
        if(find === -1){
            texture.setId(this.length);
            this.push(texture.getUuid());
        }
        else{
            this[find].setName(texture.getName());
        }
    }
};
TextureCache.prototype.export = function () {
    var list = [];
    for(var i=0; i<this.length; i++)
        list.push(this[i].getUuid());
    return list;
};
var TextureCacheSingleton = new TextureCache();



var Textures = function(){};
Textures.prototype = new Array();
Textures.prototype.addNew = function(item){
    for(var i=0; i<this.length; i++)
        if(this[i].getUuid() === item.getUuid())
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
Textures.prototype.export = function () {
    var list = [];
    for(var i=0; i<this.length; i++)
        list.push(this[i].export());
    return list;
};

var TexturesSingleton = new Textures();

var Texture = function(name,uuid){
    this.name = name;
    this.uuid = uuid;
    this.id = null;

    TextureCacheSingleton.cache(this);
};
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

var Material = function(diffuse, normal, specular){
    this.diffuse = diffuse;
    this.normal = normal;
    this.specular = specular;
};
Material.prototype.export = function(){
    return {
        d: this.diffuse.getId(),
        n: this.normal.getId(),
        s: this.specular.getId()
    };
};

var Icon = function(texture,index){
    this.texture = texture;
    this.index = index;
};
Icon.prototype.export = function(){
    return {
        t: this.texture.getId(),
        i: this.index
    };
};

var Theme = function(name, icon, jetpack_material, wing_material){
    this.name = name;
    this.icon = icon;
    this.jetpack = jetpack_material;
    this.wing = wing_material;
};
Theme.prototype.getName = function () {
    return this.name;
};
Theme.prototype.export = function(){
    var exported = {};
    exported[this.name] = {
        j: this.jetpack.export(),
        w: this.wing.export(),
        i: this.icon.export()
    };
};

var ThemeList = function(){};
ThemeList.prototype = new Array();
ThemeList.prototype.addNew = function(theme){
    for(var i=0; i<this.length; i++)
        if(this[i].getName() === theme.getName()){
            //theme exists, overwrite
            this[i] = theme;
            return false;
        }
    this.push(theme);
    return true;
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
                    path: '//placehold.it/256x256'
                }
            },
            theme: {
                name: ''
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

            console.log(x,y);
        };



        //https://secondlife.com/app/image/76822c44-6581-3552-2dc2-3a3e4792c38c/1

        $scope.saveTheme = function () {
            var name = $scope.fields.theme.name,
                jetpack = $scope.fields.textures.jetpack,
                wing = $scope.fields.textures.wing,
                jetpack_mat = new Material(jetpack.diffuse,jetpack.normal,jetpack.specular),
                wing_mat = new Material(wing.diffuse,wing.normal,wing.specular)
                ;
            $scope.themes.addNew(new Theme(name,icon,jetpack_mat,wing_mat));
        };

        $scope.iconChanged = function (item) {
            var texture = item;
            if(texture == undefined || texture.uuid == undefined)
                return;

            var canvas = $scope.canvas;
            if(canvas.getContext){
                var ctx = canvas.getContext('2d');
                var img = document.getElementById('tiles_ref');
                img.onload = function(){
                    ctx.drawImage(img, 0, 0, 256, 256);
                    img.onload = null;
                };
                $scope.fields.textures.icon.path = 'https://secondlife.com/app/image/' + texture.uuid + '/1';
            };
        };

        $scope.getTextures = function(){
            return $scope.textures.export();
        };

        $scope.refreshInventory = function refreshInventory(){
            makeRequest({'request': 'getInventory'}, (function(scope){
                scope.$apply();
            }).bind(this, $scope));
        };

        $scope.refreshInventory();
    });
